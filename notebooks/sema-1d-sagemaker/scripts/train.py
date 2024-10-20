import argparse
import math
import os
import shutil
import tempfile

import esm
import pandas as pd
import pynvml
import scipy
import torch
from sklearn.metrics import mean_squared_error, r2_score
from torch import nn
from torch.utils.data import Dataset
from transformers import (
    EvalPrediction,
    Trainer,
    TrainingArguments,
    set_seed,
)
from transformers.modeling_outputs import SequenceClassifierOutput


# Define your Dataset class
class PDB_Dataset(Dataset):
    """
    A class to represent a suitable dataset for the model.

    Converts original pandas dataframe to model set,
    where 'token_ids' are ESM-1v embeddings corresponding to protein sequence (max length 1022 AA)
    and 'labels' are contact number values.
    """

    def __init__(self, df, label_type="regression"):
        """
        Initialize the dataset.

        Parameters:
            df (pandas.DataFrame): DataFrame with two columns:
                0 -- protein sequence in string ('GLVM') or list format
                1 -- contact number values in list format [0, 0.123, ...]
            label_type (str): Type of model: 'regression' or 'binary'
        """
        self.df = df
        _, self.esm1v_alphabet = esm.pretrained.esm1v_t33_650M_UR90S_1()
        self.esm1v_batch_converter = self.esm1v_alphabet.get_batch_converter()
        self.label_type = label_type

    def __getitem__(self, idx):
        item = {}
        sequence = "".join(self.df.iloc[idx, 0])[:1022]
        _, _, esm1v_batch_tokens = self.esm1v_batch_converter([("", sequence)])
        item["token_ids"] = esm1v_batch_tokens
        labels = self.df.iloc[idx, 1][:1022]
        # Handle label transformation if necessary
        labels = [math.log(t + 1) if t != -100 else -100 for t in labels]
        item["labels"] = torch.unsqueeze(torch.FloatTensor(labels), 0).to(torch.float64)
        return item

    def __len__(self):
        return len(self.df)


# Define your Model
class ESM1vForTokenClassification(nn.Module):
    def __init__(self, num_labels=2, pretrained_no=1):
        super().__init__()
        self.num_labels = num_labels
        self.model_name = (
            esm.pretrained.esm2_t33_650M_UR50D()
        )  # load_model_and_alphabet_hub(self.model_name)

        # Load the pretrained ESM model
        self.esm1v, self.esm1v_alphabet = esm.pretrained.esm2_t33_650M_UR50D()
        self.classifier = nn.Linear(1280, self.num_labels)

    def forward(self, token_ids, labels=None):
        outputs = self.esm1v.forward(token_ids, repr_layers=[33])["representations"][33]
        outputs = outputs[:, 1:-1, :]  # Remove start and end tokens
        logits = self.classifier(outputs)
        return SequenceClassifierOutput(logits=logits)


# Custom MSE Loss with Masking
class MaskedMSELoss(nn.Module):
    def __init__(self):
        super(MaskedMSELoss, self).__init__()

    def forward(self, inputs, target, mask):
        diff2 = (
            torch.flatten(inputs[:, :, 1]) - torch.flatten(target)
        ) ** 2.0 * torch.flatten(mask)
        result = torch.sum(diff2) / torch.sum(mask)
        if torch.sum(mask) == 0:
            return torch.sum(diff2)
        else:
            return result


# Custom Trainer with MaskedMSELoss
class MaskedRegressTrainer(Trainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        labels = inputs.pop("labels")
        labels = labels.squeeze().detach().cpu().numpy().tolist()
        labels = [math.log(t + 1) if t != -100 else -100 for t in labels]
        labels = torch.unsqueeze(torch.FloatTensor(labels), 0).cuda()
        masks = ~torch.eq(labels, -100).cuda()

        outputs = model(**inputs)
        logits = outputs.logits

        loss_fn = MaskedMSELoss()
        loss = loss_fn(logits, labels, masks)

        return (loss, outputs) if return_outputs else loss


# Custom Metrics
def compute_metrics_regr(p: EvalPrediction):
    preds = p.predictions[:, :, 1]
    batch_size, seq_len = preds.shape
    out_labels, out_preds = [], []

    for i in range(batch_size):
        for j in range(seq_len):
            if p.label_ids[i, j] > -1:
                out_labels.append(p.label_ids[i, j])
                out_preds.append(preds[i, j])

    out_labels_regr = out_labels

    return {
        "pearson_r": scipy.stats.pearsonr(out_labels_regr, out_preds)[0],
        "mse": mean_squared_error(out_labels_regr, out_preds),
        "r2_score": r2_score(out_labels_regr, out_preds),
    }


# Collate Function
def collator_fn(x):
    if len(x) == 1:
        return x[0]
    print("x:", x)
    return x


def get_gpu_utilization():
    pynvml.nvmlInit()
    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
    info = pynvml.nvmlDeviceGetMemoryInfo(handle)
    return info.used // 1024**2  # Convert bytes to MB


def main(args):
    set_seed(args.seed)

    # Set the device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Set TORCH_HOME
    efs_model_path = "/home/sagemaker-user/user-default-efs/torch_hub"
    os.environ["TORCH_HOME"] = efs_model_path
    if not os.path.exists(efs_model_path):
        os.makedirs(efs_model_path)

    # Find the CSV file in the train and test directories
    train_files = [
        os.path.join(args.train_dataset_path, f)
        for f in os.listdir(args.train_dataset_path)
        if f.endswith(".csv")
    ]
    test_files = [
        os.path.join(args.eval_dataset_path, f)
        for f in os.listdir(args.eval_dataset_path)
        if f.endswith(".csv")
    ]

    # Assuming only one CSV file is present in each directory
    train_df = pd.read_csv(train_files[0])
    test_df = pd.read_csv(test_files[0])

    # Group by 'pdb_id_chain' and aggregate
    train_set = (
        train_df.groupby("pdb_id_chain")
        .agg({"resi_pos": list, "resi_aa": list, "contact_number": list})
        .reset_index()
    )

    test_set = (
        test_df.groupby("pdb_id_chain")
        .agg({"resi_pos": list, "resi_aa": list, "contact_number_binary": list})
        .reset_index()
    )

    # Initialize datasets
    train_ds = PDB_Dataset(
        train_set[["resi_aa", "contact_number"]], label_type="regression"
    )
    test_ds = PDB_Dataset(
        test_set[["resi_aa", "contact_number_binary"]], label_type="regression"
    )

    # Initialize model
    model = ESM1vForTokenClassification().to(device)

    with tempfile.TemporaryDirectory() as tmp_dir:
        # Initialize Trainer
        training_args = TrainingArguments(
            output_dir=tmp_dir,
            overwrite_output_dir=True,
            num_train_epochs=args.epochs,
            per_device_train_batch_size=args.per_device_train_batch_size,
            per_device_eval_batch_size=args.per_device_eval_batch_size,
            warmup_steps=args.warmup_steps,
            learning_rate=args.lr,
            weight_decay=args.weight_decay,
            gradient_accumulation_steps=args.gradient_accumulation_steps,
            logging_dir=f"{tmp_dir}/logs",
            logging_strategy="steps",
            logging_steps=200,
            save_strategy="no",
            evaluation_strategy="epoch",
            fp16=False,
            load_best_model_at_end=False,
            metric_for_best_model="eval_accuracy",
            greater_is_better=True,
            push_to_hub=False,
        )

        trainer = MaskedRegressTrainer(
            model=model,
            args=training_args,
            train_dataset=train_ds,
            eval_dataset=test_ds,
            data_collator=collator_fn,
            compute_metrics=compute_metrics_regr,
        )

        # Start training
        trainer.train()

        gpu_memory_use = get_gpu_utilization()
        print(f"Max GPU memory use during training: {gpu_memory_use} MB")

        # Save the model's state dictionary
        torch.save(
            trainer.model.state_dict(),
            os.path.join(args.model_output_path, "model.pth"),
        )
        print("Model state_dict saved.")

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

    # SageMaker specific arguments
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

    # Hyperparameters
    parser.add_argument(
        "--epochs", type=int, default=1, help="Number of epochs to train for."
    )
    parser.add_argument(
        "--per_device_train_batch_size",
        type=int,
        default=1,
        help="Batch size to use for training.",
    )
    parser.add_argument(
        "--per_device_eval_batch_size",
        type=int,
        default=1,
        help="Batch size to use for evaluation.",
    )
    parser.add_argument(
        "--lr", type=float, default=1e-5, help="Learning rate to use for training."
    )
    parser.add_argument("--warmup_steps", type=int, default=0)
    parser.add_argument("--weight_decay", type=float, default=0.0)
    parser.add_argument("--gradient_accumulation_steps", type=int, default=1)
    parser.add_argument(
        "--seed", type=int, default=42, help="Seed to use for training."
    )

    args = parser.parse_known_args()
    return args


if __name__ == "__main__":
    args, _ = parse_args()
    main(args)
