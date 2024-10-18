import os
import pickle

import numpy as np
import pandas as pd
from esm.sdk import client
from esm.sdk.api import ESM3InferenceClient, ESMProtein, SamplingConfig  # noqa: F401
from fastapi import FastAPI, Request

app = FastAPI()

# Global variables to hold the model and embeddings
classifier = None
cdr3_embeddings = None
ESM3_model = None


@app.on_event("startup")
async def startup_event():
    global classifier, ESM3_model
    try:
        classifier = model_fn("/opt/ml/model")
        print("Model loaded successfully during startup.")
    except Exception as e:
        print(f"Error during startup in model_fn: {e}")


@app.get("/ping")
async def health_check():
    """
    Health check endpoint required by SageMaker to ensure the container is running.
    Returns 200 if the model is loaded and ready.
    """
    if classifier is not None and ESM3_model is not None:
        return {"status": "healthy"}
    else:
        return {"status": "unhealthy"}, 500


@app.post("/invocations")
async def invocations(request: Request):
    """
    Inference endpoint for SageMaker.
    SageMaker sends inference requests to this endpoint.
    """
    try:
        # Get the request content type and body
        request_content_type = request.headers.get("content-type")
        request_body = await request.body()

        # Parse the input
        input_data = input_fn(request_body.decode("utf-8"), request_content_type)

        # Perform prediction
        predictions = predict_fn(input_data, classifier)

        # Return output
        return output_fn(predictions, "application/json")
    except Exception as e:
        print(f"Error during invocations: {e}")
        return {"error": str(e)}, 500


def model_fn(model_dir):
    """
    Load the model for inference. This function will be called by SageMaker once the container starts.
    """
    global classifier, cdr3_embeddings, ESM3_model

    try:
        # Load classifier and CDR3 embeddings
        pickle_path = os.path.join(model_dir, "model_with_embeddings.pkl")
        print(f"Loading model from {pickle_path}...")
        with open(pickle_path, "rb") as f:
            data = pickle.load(f)
            classifier = data["classifier"]
            cdr3_embeddings = data["cdr3_embeddings"]
        print("Model and CDR3 embeddings loaded successfully.")
    except Exception as e:
        print(f"Error loading model from {pickle_path}: {e}")

    # Initialize ESM-3 model client
    try:
        model_name = "esm3-small-2024-08"
        token = os.getenv("ESM3_TOKEN")
        if not token:
            raise ValueError("ESM3_TOKEN environment variable not set.")
        print("Initializing ESM-3 model client...")
        ESM3_model = client(
            model=model_name,
            url="https://forge.evolutionaryscale.ai",
            token=token,
        )
        print("ESM3 model initialized successfully.")
    except Exception as e:
        print(f"Error initializing ESM-3 model: {e}")

    return classifier


def input_fn(request_body, request_content_type):
    """
    Deserialize the input data.
    """
    if request_content_type == "application/json":
        input_data = pd.read_json(request_body)
        print(f"Input data: {input_data}")
        return input_data
    else:
        raise ValueError(f"Unsupported content type: {request_content_type}")


def predict_fn(input_data, model):
    """
    Generate predictions using the model.
    """
    global ESM3_model
    epitopes = input_data["epitopes"]
    predictions = []

    for epitope in epitopes:
        # Generate epitope embedding
        epitope_embedding = generate_epitope_embedding(epitope)
        if epitope_embedding is None:
            predictions.append({"epitope": epitope, "predicted_prob": None})
            continue

        # Preprocess features for the classifier (ESMonly)
        X = preprocess_features(epitope_embedding)

        # Make prediction
        prob = model.predict_proba(X)[:, 1][0]  # Probability of the positive class
        predictions.append({"epitope": epitope, "predicted_prob": prob})

    return predictions


def output_fn(prediction, response_content_type):
    """
    Serialize the prediction result.
    """
    if response_content_type == "application/json":
        return {"predictions": prediction}
    else:
        raise ValueError(f"Unsupported content type: {response_content_type}")


def generate_epitope_embedding(epitope_sequence):
    """
    Generate an embedding for a given epitope sequence using ESM-3.
    """
    embedding = run_ESM3(epitope_sequence, ESM3_model)
    if embedding is not None:
        # Assuming the ESM-3 embeddings have 256 dimensions; adjust if different
        print(f"Embedding for {epitope_sequence}: {embedding[:5]}...")
        return embedding
    else:
        return np.zeros(256)  # Example: return a zero vector


def run_ESM3(seq, model):
    try:
        print(f"Processing sequence: {seq}")
        protein = ESMProtein(sequence=seq)
        protein_tensor = model.encode(protein)

        # Adding more print statements to debug the steps
        print(f"Protein encoded: {protein_tensor.shape}")

        output = model.forward_and_sample(
            protein_tensor, SamplingConfig(return_per_residue_embeddings=True)
        )
        print("Model output obtained.")

        df = pd.DataFrame(output.per_residue_embedding)
        column_means = df.mean(axis=0)
        print(f"Calculated embedding mean values for: {seq}")

        return column_means.values  # Return as numpy array
    except Exception as e:
        print(f"Error processing sequence: {seq}")
        print(e)
        return None  # Handle the error as needed


def preprocess_features(epitope_embedding):
    """
    Preprocess the input features for the classifier.
    Since using ESMonly, only include ESM3 features.
    """
    epitope_df = pd.DataFrame([epitope_embedding])
    epitope_df.columns = [
        f"ESM3_{i}" for i in range(len(epitope_embedding))
    ]  # Adjust based on ESM3 embedding size

    # Ensure that the classifier expects only ESM3 features
    predefined_columns = classifier.feature_names_in_
    for col in predefined_columns:
        if col not in epitope_df.columns:
            epitope_df[col] = 0

    epitope_df = epitope_df[predefined_columns]
    print(
        f"Features for prediction: {epitope_df.iloc[0, :5].values}..."
    )  # Print first 5 features for brevity
    return epitope_df
