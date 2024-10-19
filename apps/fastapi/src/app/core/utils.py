import csv
import io
import logging
import re
from io import StringIO
from typing import List, Optional, Type, TypeVar

import aioboto3
import boto3
import httpx
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError

from app.core.config import settings

logger = logging.getLogger(__name__)

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
                    logger.error(f"Validation error in row {row}: {e}")
                    continue
            else:
                rows.append(row)

    except Exception as e:
        logger.error(f"Error reading CSV from S3: {bucket}/{s3_key} {e}")
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
        logger.warning(f"No Endpoints found for filter: {endpoint_name_filter}")
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
        logger.error(f"Failed to get models on endpoint: {e}")
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
        return re.sub(r"[\W_]+", "", s)
    else:
        return s


async def fetch_pdb_data(pdb_id: str, chain: Optional[str] = None) -> dict:
    """
    Fetches polymer entity instance data from the RCSB PDB REST API.

    Args:
        pdb_id (str): The PDB ID.
        chain (Optional[str]): The chain ID.

    Returns:
        dict: Parsed JSON response from the API.

    Raises:
        HTTPException: If the PDB entry or chain is not found or other errors occur.
    """
    if chain:
        url = f"https://data.rcsb.org/rest/v1/core/polymer_entity_instance/{pdb_id}/{chain}"
    else:
        url = f"https://data.rcsb.org/rest/v1/core/entry/{pdb_id}"
    headers = {"Accept": "application/json"}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            detail = (
                f"PDB entry {pdb_id} with chain {chain} not found."
                if chain
                else f"PDB entry {pdb_id} not found."
            )
            raise HTTPException(status_code=404, detail=detail)
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Error fetching PDB data: {response.status_code}",
            )


def split_protein_sequence(
    protein_sequence: str, min_length: int, max_length: int
) -> List[str]:
    """
    Splits a protein sequence into peptides based on the provided min and max lengths.
    """
    peptides = []
    for length in range(min_length, max_length + 1):
        peptides.extend(
            [
                protein_sequence[i : i + length]
                for i in range(len(protein_sequence) - length + 1)
            ]
        )
    return peptides


def get_default_peptide_lengths(prediction_type: str):
    if prediction_type == "mhc-i":
        return 8, 11
    elif prediction_type == "mhc-ii":
        return 13, 25
    # Add other prediction types if needed
    return 8, 11  # Fallback default lengths


def generate_csv_key(
    user_id: str, job_id: str, timestamp: str, prediction_type: str
) -> str:
    """
    Generates a unique S3 key for the CSV file based on user ID, job ID, and timestamp.
    """
    return f"predictions/{user_id}/{job_id}_{prediction_type}_{timestamp}.csv"


async def upload_csv_to_s3(results: List[T], s3_key: str):
    """
    Uploads the processed results to S3 as a CSV file, using the Pydantic schema to generate the columns.
    :param results: List of Pydantic models (MhcIPredictionResult, MhcIIPredictionResult, etc.)
    :param s3_key: The key (path) where the CSV will be stored in S3.
    """
    if not results:
        raise HTTPException(status_code=400, detail="No results to upload")

    # Dynamically get the field names (columns) from the Pydantic schema
    fieldnames = list(results[0].model_fields.keys())

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames, quoting=csv.QUOTE_NONNUMERIC)
    writer.writeheader()

    # Convert results (Pydantic models) to dictionaries for CSV writing
    for result in results:
        writer.writerow(result.model_dump())

    csv_content = output.getvalue()

    # Upload the CSV to S3
    async with aioboto3.client("s3", region_name=settings.AWS_REGION) as s3_client:
        try:
            await s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME, Key=s3_key, Body=csv_content
            )
        except Exception:
            raise HTTPException(status_code=500, detail="Failed to upload CSV to S3")
