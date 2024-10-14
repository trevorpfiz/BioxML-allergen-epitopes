import csv
import logging
import re
from io import StringIO
from typing import List, Type, TypeVar

import boto3
from pydantic import BaseModel, ValidationError

from app.core.config import settings

# Create a TypeVar to represent the schema type
T = TypeVar("T", bound=BaseModel)


def read_s3_csv(
    bucket: str, s3_key: str, schema: Type[T], validate_rows: bool = True
) -> List[T]:
    """
    Download CSV from S3, optionally validate rows with Pydantic schema, and return a list of rows.
    :param bucket: S3 bucket name.
    :param s3_key: S3 object key.
    :param schema: Pydantic model to validate the rows.
    :param validate_rows: Whether to validate the rows or not.
    :return: List of validated rows or raw rows.
    """
    try:
        s3_client = boto3.client("s3")
        obj = s3_client.get_object(Bucket=bucket, Key=s3_key)
        csv_content = obj["Body"].read().decode("utf-8")

        # Parse the CSV
        csvfile = StringIO(csv_content)
        reader = csv.DictReader(csvfile)

        rows = []
        for row in reader:
            if validate_rows:
                try:
                    # Validate using the provided schema
                    validated_row = schema.model_validate(row)
                    rows.append(validated_row)
                except (ValidationError, ValueError) as e:
                    logging.error(f"Validation error in row {row}: {e}")
                    continue
            else:
                rows.append(row)

    except Exception as e:
        logging.error(f"Error reading CSV from S3: {bucket}/{s3_key} {e}")
        return []

    return rows


# CRUD Sagemaker Endpoints
def get_endpoints(endpoint_name_filter, sagemaker_client=None):
    if sagemaker_client is None:
        sagemaker_client = boto3.client("sagemaker", region_name=settings.REGION)
    # Retrieve all endpoints for filtered name
    response = sagemaker_client.list_endpoints(
        SortBy="Name", NameContains=endpoint_name_filter, MaxResults=100
    )
    sagemaker_endpoints_for_service = response["Endpoints"]
    # AWS request pagination
    while "NextToken" in response:
        response = sagemaker_client.list_endpoints(
            NextToken=response["NextToken"],
            SortBy="Name",
            NameContains=endpoint_name_filter,
            MaxResults=100,
        )
        sagemaker_endpoints_for_service.extend(response["Endpoints"])
    endpoints = []
    for i in sagemaker_endpoints_for_service:
        endpoints.append(i["EndpointName"])
    if len(endpoints) == 0:
        print(f"No Endpoints found for filter: {endpoint_name_filter}")
    return endpoints


def get_endpoint(endpoint_name_filter, sagemaker_client=None):
    if sagemaker_client is None:
        sagemaker_client = boto3.client("sagemaker", region_name=settings.REGION)
    endpoints = get_endpoints(endpoint_name_filter, sagemaker_client=sagemaker_client)
    if len(endpoints) == 0:
        return None
    else:
        return endpoints[0]


def get_models_on_endpoint(model_data_prefix):
    s3_resource = boto3.resource("s3")
    bucket_obj = s3_resource.Bucket(settings.ARTIFACTS_BUCKET)
    prefix = model_data_prefix.replace(f"s3://{settings.ARTIFACTS_BUCKET}/", "")
    try:
        models_on_endpoint = [
            i.key.replace(prefix, "") for i in bucket_obj.objects.filter(Prefix=prefix)
        ]
        return models_on_endpoint
    except Exception as e:
        logging.error(f" --- Failed to get models on endpoint ---- {e}")
        models_on_endpoint = []
        return models_on_endpoint


def get_model_on_endpoint(model_data_prefix, model_substring="", latest=None):
    """
    The model string is returned if the substring of the model we are looking for is on the endpoint
    :param model_substring:
    :return:
    """
    models_on_endpoint = get_models_on_endpoint(model_data_prefix)
    if latest is not None:
        sorted(models_on_endpoint)
        return models_on_endpoint[0]
    res = None
    for model in models_on_endpoint:
        if model_substring in model:
            res = model
            break
    return res


def clean_string(s):
    if isinstance(s, str):
        return re.sub("[\W_]+", "", s)
    else:
        return s
