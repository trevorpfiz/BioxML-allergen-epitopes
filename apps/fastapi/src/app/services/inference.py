import json
import logging
from typing import Any, Dict, List

import boto3
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


CLASSI_URL = f"{settings.EC2_TOOLS_API_URL}/api/v1/prediction/netmhcpan/"
CLASSII_URL = f"{settings.EC2_TOOLS_API_URL}/api/v1/prediction/netmhciipan/"


def get_sagemaker_predictions(requests, endpoint_name, model_name, model_type="mme"):
    """
    Pass preprocessed requests to the specific endpoint (mme or single)
    """
    sagemaker_runtime = boto3.client(
        "sagemaker-runtime", region_name=settings.AWS_REGION
    )
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


timeout = httpx.Timeout(
    10.0, read=3000.0
)  # 10 seconds connect, 50 minutes read timeout


async def run_netmhci_binding_affinity_classI(
    peptides: List[str], alleles: List[str]
) -> List[Dict[str, Any]]:
    """
    Calls the NetMHCpan API with peptides and alleles to get binding affinity results.

    Args:
        peptides (List[str]): List of peptide sequences.
        alleles (List[str]): List of HLA alleles for predictions.

    Returns:
        List[Dict[str, Any]]: List of prediction results.
    """
    payload = {"peptides": peptides, "alleles": alleles}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(CLASSI_URL, json=payload)
            response.raise_for_status()
            results = response.json()
            return results
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        logger.error(f"Request error: {e}")
        # Return an error in the same structure as successful results
        return [{"peptides": peptides, "error": str(e)}]  # List with error
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error: {e.response.status_code}, details: {e.response.text}"
        )
        return {"error": e.response.text}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"error": str(e)}


async def run_netmhcii_binding_affinity_classII(
    peptides: List[str], alleles: List[str]
) -> List[Dict[str, Any]]:
    """
    Calls the NetMHCIIpan API with peptides and alleles to get class II binding affinity results.

    Args:
        peptides (List[str]): List of peptide sequences.
        alleles (List[str]): List of HLA alleles for predictions.

    Returns:
        List[Dict[str, Any]]: List of prediction results.
    """
    payload = {"peptides": peptides, "alleles": alleles}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(CLASSII_URL, json=payload)
            response.raise_for_status()
            results = response.json()
            return results
    except (httpx.RequestError, httpx.HTTPStatusError) as e:
        logger.error(f"Request error: {e}")
        return [{"peptides": peptides, "error": str(e)}]
    except httpx.HTTPStatusError as e:
        logger.error(
            f"HTTP error: {e.response.status_code}, details: {e.response.text}"
        )
        return {"error": e.response.text}
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return {"error": str(e)}
