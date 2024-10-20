import argparse
import os
import shutil
import tempfile

import evaluate
import numpy as np
import pynvml
import scipy
import torch
from datasets import load_from_disk
from peft import (
    LoraConfig,
    PeftConfig,
    PeftModel,
    TaskType,
    get_peft_model,
    prepare_model_for_kbit_training,
)
from sklearn.metrics import mean_squared_error, r2_score
from torchinfo import summary
from transformers import (
    AutoTokenizer,
    BitsAndBytesConfig,
    DataCollatorForTokenClassification,
    EsmForTokenClassification,
    Trainer,
    TrainingArguments,
    set_seed,
)


def main(args):
    set_seed(args.seed)

    model = get_model(
        args.model_id,
        quantization=args.quantization,
        lora=args.lora,
        use_gradient_checkpointing=args.use_gradient_checkpointing,
        mixed_precision=args.mixed_precision,
    )

    tokenizer = AutoTokenizer.from_pretrained(args.model_id)

    data_collator = DataCollatorForTokenClassification(
        tokenizer=tokenizer,
        # padding='max_length',
        # max_length=args.max_length,
        label_pad_token_id=-100,
    )

    with tempfile.TemporaryDirectory() as tmp_dir:
        training_args = TrainingArguments(
            output_dir=tmp_dir,
            overwrite_output_dir=True,
            per_device_train_batch_size=args.per_device_train_batch_size,
            per_device_eval_batch_size=args.per_device_eval_batch_size,
            bf16=True if args.mixed_precision == "bf16" else None,
            learning_rate=args.lr,
            num_train_epochs=args.epochs,
            gradient_accumulation_steps=args.gradient_accumulation_steps,
            gradient_checkpointing=args.use_gradient_checkpointing,
            logging_dir=f"{tmp_dir}/logs",
            logging_strategy="steps",
            logging_steps=16,
            evaluation_strategy="epoch",
            save_strategy="no",
            optim=args.optim,
            weight_decay=0.01,
            push_to_hub=False,
        )

        train_dataset = load_from_disk(args.train_dataset_path)
        eval_dataset = load_from_disk(args.eval_dataset_path)

        # Custom trainer for regression (Masked MSE Loss)
        trainer = MaskedRegressTrainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
        )

        # Start training
        with torch.autocast("cuda"):
            trainer.train()

        gpu_memory_use = get_gpu_utilization()
        print(f"Max GPU memory use during training: {gpu_memory_use} MB")
        if args.lora:
            trainer.model.save_pretrained(tmp_dir)
            # clear memory
            del model
            del trainer
            torch.cuda.empty_cache()
            # load PEFT model in fp16
            peft_config = PeftConfig.from_pretrained(tmp_dir)
            model = EsmForTokenClassification.from_pretrained(
                peft_config.base_model_name_or_path,
                return_dict=True,
                torch_dtype=torch.float16,
            )
            model = PeftModel.from_pretrained(model, tmp_dir)
            model.eval()
            # Merge LoRA and base model and save
            merged_model = model.merge_and_unload()
            merged_model.save_pretrained(args.model_output_path)
        else:
            trainer.model.save_pretrained(args.model_output_path)

    # save tokenizer for easy inference
    tokenizer.save_pretrained(args.model_output_path)

    # copy inference script
    os.makedirs("/opt/ml/model/code", exist_ok=True)
    shutil.copyfile(
        os.path.join(os.path.dirname(__file__), "inference.py"),
        "/opt/ml/model/code/inference.py",
    )
    shutil.copyfile(
        os.path.join(os.path.dirname(__file__), "requirements.txt"),
        "/opt/ml/model/code/requirements.txt",
    )


def parse_args():
    """Parse the arguments."""
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--model_id",
        type=str,
        default="facebook/esm2_t36_3B_UR50D",
        help="Model id to use for training.",
    )
    parser.add_argument(
        "--train_dataset_path",
        type=str,
        default=os.environ["SM_CHANNEL_TRAIN"],
        help="Path to train dataset.",
    )
    parser.add_argument(
        "--eval_dataset_path",
        type=str,
        default=os.environ["SM_CHANNEL_TEST"],
        help="Path to evaluation dataset.",
    )
    parser.add_argument(
        "--model_output_path",
        type=str,
        default=os.environ["SM_MODEL_DIR"],
        help="Path to model output folder.",
    )
    parser.add_argument(
        "--epochs", type=int, default=1, help="Number of epochs to train for."
    )
    parser.add_argument(
        "--per_device_train_batch_size",
        type=int,
        default=8,
        help="Batch size to use for training.",
    )
    parser.add_argument(
        "--per_device_eval_batch_size",
        type=int,
        default=8,
        help="Batch size to use for evaluation.",
    )
    parser.add_argument(
        "--optim", type=str, default="adamw_torch", help="Optimizer name"
    )

    parser.add_argument(
        "--lr", type=float, default=1e-05, help="Learning rate to use for training."
    )
    parser.add_argument(
        "--seed", type=int, default=42, help="Seed to use for training."
    )
    parser.add_argument(
        "--gradient_accumulation_steps",
        type=int,
        default=1,
        help="Gradient accumulation steps.",
    )
    parser.add_argument(
        "--max_length",
        type=int,
        default=1022,
        help="Max length of sequence for collator.",
    )
    parser.add_argument(
        "--quantization",
        type=str,
        default=None,
        help="Degree of bitsandbytes quantization",
        choices=[
            "8bit",
            "4bit",
        ],
    )
    parser.add_argument(
        "--lora",
        type=bool,
        default=False,
        help="Whether or not to train with low-ranked adaptors via PEFT",
    )
    parser.add_argument(
        "--use_gradient_checkpointing",
        type=bool,
        default=False,
        help="Whether or not to train with gradient checkpointing via PEFT",
    )
    parser.add_argument(
        "--mixed_precision",
        type=str,
        default="bf16" if torch.cuda.get_device_capability()[0] >= 8 else "fp16",
        help="Whether or not to use mixed precision training. Choose from ‘no’,‘fp16’,‘bf16 or ‘fp8’",
    )

    args = parser.parse_known_args()
    return args


# Setup evaluation
metric = evaluate.load("accuracy")


def compute_metrics(eval_pred):
    # Squeeze the last dimension if num_labels=1
    preds = eval_pred.predictions.squeeze(-1)  # Shape: [batch_size, seq_len]
    labels = eval_pred.label_ids  # Shape: [batch_size, seq_len]

    # Convert to Numpy arrays if they aren't already
    if isinstance(preds, torch.Tensor):
        preds = preds.detach().cpu().numpy()
    if isinstance(labels, torch.Tensor):
        labels = labels.detach().cpu().numpy()

    # Check for NaNs using numpy
    if np.isnan(preds).any() or np.isnan(labels).any():
        print("NaN detected in predictions or labels during evaluation")
        return {"mse": float("nan"), "r2": float("nan"), "pearson_r": float("nan")}

    # Flatten the arrays and filter out masked labels (-100)
    out_labels, out_preds = [], []
    for i in range(preds.shape[0]):
        for j in range(preds.shape[1]):
            if labels[i, j] > -1:
                out_labels.append(labels[i, j])
                out_preds.append(preds[i, j])

    out_labels = np.array(out_labels)
    out_preds = np.array(out_preds)

    # Compute metrics
    if len(out_labels) == 0 or len(out_preds) == 0:
        return {"mse": float("nan"), "r2": float("nan"), "pearson_r": float("nan")}

    pearson_r = (
        scipy.stats.pearsonr(out_labels, out_preds)[0]
        if len(out_labels) > 1
        else float("nan")
    )
    mse = mean_squared_error(out_labels, out_preds)
    r2 = r2_score(out_labels, out_preds)

    return {"mse": mse, "r2": r2, "pearson_r": pearson_r}


def get_quant_config(quantization=None, dtype=torch.float16):
    if quantization == "4bit":
        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=dtype,
            llm_int8_skip_modules=["classifier"],
        )
    elif quantization == "8bit":
        return BitsAndBytesConfig(
            load_in_8bit=True, llm_int8_skip_modules=["classifier"]
        )
    else:
        return None


def get_model(
    model_name_or_path,
    config=None,
    trust_remote_code=False,
    quantization=None,
    lora=False,
    use_gradient_checkpointing=False,
    mixed_precision=None,
):
    datatype = torch.bfloat16 if mixed_precision == "bf16" else torch.float16

    model = EsmForTokenClassification.from_pretrained(
        model_name_or_path,
        from_tf=bool(".ckpt" in model_name_or_path),
        config=config,
        trust_remote_code=trust_remote_code,
        quantization_config=get_quant_config(quantization, datatype),
        torch_dtype=datatype,
        num_labels=1,  # Single label for regression
    )
    print("Pretrained model architecture:")
    summary(model)

    if lora:
        peft_config = LoraConfig(
            task_type=TaskType.TOKEN_CLS,
            inference_mode=False,
            bias="none",
            r=8,
            lora_alpha=16,
            lora_dropout=0.05,
            target_modules=[
                "query",
                "key",
                "value",
                "EsmSelfOutput.dense",
                "EsmIntermediate.dense",
                "EsmOutput.dense",
                "EsmContactPredictionHead.regression",
                "EsmClassificationHead.dense",
                "EsmClassificationHead.out_proj",
            ],
        )

        if quantization:
            model = prepare_model_for_kbit_training(model, use_gradient_checkpointing)

        model = get_peft_model(model, peft_config)
        print("Model architecture after processing with PEFT:")
        summary(model)

    return model


def get_gpu_utilization():
    pynvml.nvmlInit()
    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    info = pynvml.nvmlDeviceGetMemoryInfo(handle)

    return info.used // 1024**2


class MaskedRegressTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        labels = inputs.pop("labels")  # Tensor of shape [batch_size, seq_len]

        # Create mask for valid labels (labels != -100)
        masks = labels != -100  # Tensor of shape [batch_size, seq_len]

        # Print label statistics
        print(f"Label min: {labels.min().item()}, Label max: {labels.max().item()}")

        # Ensure labels are non-negative before applying log1p
        # Replace any label < 0 (and != -100) with -100 to mask them
        labels = torch.where(
            (labels >= 0) & masks, labels, torch.tensor(-100.0, device=labels.device)
        )

        # Apply log(t + 1) transformation
        labels = torch.log1p(labels)

        # Replace masked labels (-100) with 0 to prevent NaNs in loss computation
        labels = torch.where(masks, labels, torch.tensor(0.0, device=labels.device))

        # Forward pass
        outputs = model(**inputs)
        logits = outputs.logits  # Shape: [batch_size, seq_len, 1]

        # Debugging: Check for NaNs in logits and labels
        if torch.isnan(logits).any():
            print("NaN detected in logits")
        if torch.isnan(labels).any():
            print("NaN detected in labels")

        # Reshape tensors to [batch_size * seq_len]
        logits = logits.view(-1)
        labels = labels.view(-1)
        masks = masks.view(-1)

        # Debugging: Print shapes and number of valid labels
        print(f"Logits reshaped: {logits.shape}")
        print(f"Labels reshaped: {labels.shape}")
        print(f"Masks reshaped: {masks.shape}")
        print(f"Number of valid labels: {masks.sum().item()}")

        # Apply the mask and compute the loss
        loss_fct = torch.nn.MSELoss()
        loss = loss_fct(logits[masks], labels[masks])

        return (loss, outputs) if return_outputs else loss


if __name__ == "__main__":
    args, _ = parse_args()
    main(args)
