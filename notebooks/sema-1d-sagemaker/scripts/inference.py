import logging
import os

import esm
import torch
from torch import nn
from transformers.modeling_outputs import SequenceClassifierOutput

logger = logging.getLogger(__name__)


def model_fn(model_dir):
    """
    Load the model and ESM batch converter from the model directory.

    Args:
        model_dir (str): Directory where the model artifacts are saved.

    Returns:
        Tuple[torch.nn.Module, esm.pretrained.Alphabet]: The loaded model and ESM batch converter.
    """
    logger.debug(f"Loading model from {model_dir}")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.debug(f"Using device: {device}")

    # Define the custom model class
    class ESM1vForTokenClassification(nn.Module):
        def __init__(self, num_labels=2, pretrained_no=1):
            super().__init__()
            self.num_labels = num_labels
            self.model_name = "esm1v_t33_650M_UR90S_" + str(pretrained_no)

            # Load the pretrained ESM-1v model and alphabet
            self.esm1v, self.esm1v_alphabet = esm.pretrained.esm1v_t33_650M_UR90S_1()
            self.classifier = nn.Linear(1280, self.num_labels)
            logger.debug("ESM model initialized")

        def forward(self, token_ids, labels=None):
            outputs = self.esm1v.forward(token_ids, repr_layers=[33])[
                "representations"
            ][33]
            logger.debug(
                f"Model forward pass completed, token_ids shape: {token_ids.shape}"
            )
            outputs = outputs[:, 1:-1, :]  # Remove start and end tokens
            logits = self.classifier(outputs)
            return SequenceClassifierOutput(logits=logits)

    # Initialize and load the model
    model = ESM1vForTokenClassification().to(device)
    logger.debug("Model instantiated and moved to device")

    # Load the state_dict from 'model.pth'
    model.load_state_dict(
        torch.load(os.path.join(model_dir, "model.pth"), map_location=device)
    )
    logger.debug("Model weights loaded from model.pth")

    model.eval()
    logger.debug("Model set to evaluation mode")

    # Initialize the ESM batch converter
    _, esm1v_alphabet = esm.pretrained.esm1v_t33_650M_UR90S_1()
    batch_converter = esm1v_alphabet.get_batch_converter()

    logger.debug("Batch converter initialized")

    return model, batch_converter


def input_fn(request_body, request_content_type):
    """
    Parse the incoming request body.

    Args:
        request_body (str): The body of the request.
        request_content_type (str): The content type of the request.

    Returns:
        str: The protein sequence.
    """
    import json

    if request_content_type == "application/json":
        data = json.loads(request_body)
        if "sequence" in data:
            return data["sequence"]
        else:
            raise ValueError("JSON input must contain 'sequence' key.")
    elif request_content_type == "text/plain":
        return request_body
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")


def predict_fn(input_data, model_and_batch_converter):
    """
    Perform prediction using the loaded model and batch converter.

    Args:
        input_data (str): The protein sequence.
        model_and_batch_converter (Tuple[torch.nn.Module, esm.pretrained.Alphabet]): The loaded model and batch converter.

    Returns:
        List[float]: Per-residue epitope probabilities.
    """
    model, batch_converter = model_and_batch_converter
    logger.debug(f"Received input_data: {input_data}")

    device = next(model.parameters()).device
    logger.debug(f"Model is using device: {device}")

    # Prepare the batch
    batch = batch_converter([("", input_data)])
    token_ids = batch[2].to(device)
    logger.debug(f"Batch prepared, token_ids shape: {token_ids.shape}")

    with torch.no_grad():
        outputs = model(token_ids)
        logits = outputs.logits
        probs = torch.sigmoid(logits)  # Apply sigmoid for binary classification
        probs = probs.cpu().numpy()

    # Extract per-residue epitope probabilities (class 1 in a binary classification)
    epitope_probs = probs[0, :, 1].tolist()
    logger.debug(f"Predicted probabilities: {epitope_probs}")

    return epitope_probs


def output_fn(prediction, response_content_type):
    """
    Format the prediction output.

    Args:
        prediction (List[float]): The prediction probabilities.
        response_content_type (str): The desired content type of the response.

    Returns:
        Tuple[str, str]: The response body and its content type.
    """
    import json

    if response_content_type == "application/json":
        return json.dumps({"epitope_probabilities": prediction}), response_content_type
    elif response_content_type == "text/plain":
        return str(prediction), response_content_type
    else:
        raise ValueError(f"Unsupported response content type: {response_content_type}")
