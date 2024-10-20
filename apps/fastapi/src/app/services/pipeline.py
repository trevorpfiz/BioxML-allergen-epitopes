from typing import Any, List

from app.core.utils import get_endpoint
from app.services.inference import get_sagemaker_predictions


def run(
    input_objects: List[Any],
    endpoint_name: str,
    model_name=None,
    model_type="mme",
):
    """
     Process the input inferences and get predictions from the sagemaker endpoint
    :param inferences:
    :param endpoint_name:
    :param model_name:
    :param model_type:
    :return: List[Predictions]
    """

    endpoint = get_endpoint(endpoint_name_filter=endpoint_name)
    if endpoint is None:
        raise Exception(f"Endpoint for {endpoint_name} does not exist")

    # If we dont have a model_name default is endpoint name
    if model_name is None:
        model_name = endpoint_name

    # Preprocess the inputs
    preprocess = [obj for obj in input_objects]

    # Run inference
    model_responses = get_sagemaker_predictions(
        preprocess,
        endpoint_name,
        model_name,
        model_type=model_type,
    )

    # Postprocess the inferences
    predictions = model_responses

    return predictions
