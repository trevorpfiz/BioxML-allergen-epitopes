from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.inference import run_binding_predictions

router = APIRouter()


# Input data model
class PredictionRequest(BaseModel):
    peptides: List[str]
    alleles: List[str]


@router.post("/netmhcpan/")
async def run_netmhcpan(request: PredictionRequest):
    """
    Endpoint to run NetMHCpan predictions on input peptides and alleles.
    """
    try:
        predictions = await run_binding_predictions(
            peptides=request.peptides,
            alleles=request.alleles,
            predictor_type="netmhcpan",
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/netmhciipan/")
async def run_netmhciipan(request: PredictionRequest):
    """
    Endpoint to run NetMHCIIpan predictions on input peptides and alleles.
    """
    try:
        predictions = await run_binding_predictions(
            peptides=request.peptides,
            alleles=request.alleles,
            predictor_type="netmhciipan",
        )
        return predictions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
