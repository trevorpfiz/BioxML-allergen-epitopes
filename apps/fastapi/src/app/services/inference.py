import asyncio
import json
import logging
from typing import Any, Dict, List

import boto3
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


IEDB_API_URL_CLASSI = "http://tools-cluster-interface.iedb.org/tools_api/mhci/"
IEDB_API_URL_CLASSII = "http://tools-cluster-interface.iedb.org/tools_api/mhcii/"


def get_sagemaker_predictions(requests, endpoint_name, model_name, model_type="mme"):
    """
    Pass preprocessed requests to the specific endpoint (mme or single)
    """
    sagemaker_runtime = boto3.client("sagemaker-runtime", region_name=settings.REGION)
    responses = []
    for request in requests:
        if model_type == "mme":
            response = sagemaker_runtime.invoke_endpoint(
                ContentType="application/json",
                EndpointName=endpoint_name,
                TargetModel=model_name,
                Body=json.dumps(request),
            )
            res = json.loads(response["Body"].read().decode("utf-8"))[0]
        else:
            response = sagemaker_runtime.invoke_endpoint(
                ContentType="application/json",
                EndpointName=endpoint_name,
                Body=json.dumps(request),
            )
            res = json.loads(response["Body"].read().decode("utf-8"))
        responses.append(res)
    return responses


async def run_netmhci_binding_affinity_classI(
    peptides: List[str], alleles: List[str], method: str = "netmhcpan-4.1"
) -> List[Dict[str, Any]]:
    """
    Uses IEDB API to generate binding affinity for each peptide and HLA interaction.

    Args:
        peptides (list): A list of peptide sequences.
        alleles (list): A list of HLA alleles for which to make predictions.
        method (str): Prediction method to use.

    Returns:
        list: A list of dictionaries containing the binding affinity results or errors.
    """
    results = []
    peptides_by_length = {}

    # Group peptides by their length
    for peptide in peptides:
        length = len(peptide)
        peptides_by_length.setdefault(length, []).append(peptide)

    async with httpx.AsyncClient() as client:
        for allele in alleles:
            for length, peptides_subset in peptides_by_length.items():
                sequence_text = "\n".join(
                    [
                        f">peptide{i}\n{peptide}"
                        for i, peptide in enumerate(peptides_subset)
                    ]
                )

                payload = {
                    "method": method,
                    "sequence_text": sequence_text,
                    "allele": allele,
                    "length": str(length),
                    "species": "human",
                }

                retries = 0
                max_retries = 5
                while retries < max_retries:
                    try:
                        response = await client.post(IEDB_API_URL_CLASSI, data=payload)

                        # Handle 403 and 500 errors with retry logic
                        if response.status_code in [403, 500]:
                            retries += 1
                            sleep_time = 2**retries  # Exponential backoff
                            logger.error(
                                f"Server error {response.status_code}. Retrying in {sleep_time} seconds..."
                            )
                            await asyncio.sleep(sleep_time)
                        else:
                            response.raise_for_status()  # Raise error for any other issues
                            results.append(
                                {
                                    "allele": allele,
                                    "length": length,
                                    "peptides": peptides_subset,
                                    "result": response.text,
                                }
                            )
                            logger.info(
                                f"Successfully retrieved data for allele {allele} and length {length}."
                            )
                            break  # Break loop on success
                    except httpx.RequestError as e:
                        if retries == max_retries:
                            logger.error(
                                f"Max retries reached for allele {allele} and length {length}: {e}"
                            )
                            results.append(
                                {
                                    "allele": allele,
                                    "length": length,
                                    "peptides": peptides_subset,
                                    "error": str(e),
                                }
                            )
                        else:
                            retries += 1
                            sleep_time = 2**retries
                            logger.error(
                                f"Request error. Retrying in {sleep_time} seconds for allele {allele} and length {length}: {e}"
                            )
                            await asyncio.sleep(sleep_time)
                    except Exception as e:
                        logger.error(f"Unexpected error: {e}")
                        break

    return results
