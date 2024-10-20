import torch
from transformers import AutoTokenizer, EsmForTokenClassification


# Load the model and tokenizer
def model_fn(model_dir):
    # Load the EsmForTokenClassification model for regression
    model = EsmForTokenClassification.from_pretrained(
        model_dir,
        device_map="auto",
        num_labels=1,  # Since it's a regression task
    )
    tokenizer = AutoTokenizer.from_pretrained(model_dir)

    return model, tokenizer


# Prediction function
def predict_fn(data, model_and_tokenizer):
    model, tokenizer = model_and_tokenizer
    model.eval()

    # Prepare input data for the model
    inputs = data.pop("inputs", data)
    encoding = tokenizer(inputs, return_tensors="pt")
    encoding = {k: v.to(model.device) for k, v in encoding.items()}

    # Run inference
    with torch.no_grad():
        results = model(**encoding)

    # For regression, we directly use the logits as the predicted value
    predictions = results.logits.cpu().numpy()

    return {
        "predicted_contact_number": predictions[0].tolist()
    }  # Return prediction(s) as a list
