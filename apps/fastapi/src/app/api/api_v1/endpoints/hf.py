# app/api/v1/predict.py

from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from supabase import AsyncClient

from app.api.deps import CurrentUser, get_db
from app.crud.crud_report import crud_report
from app.schemas.report import ReportCreate
from app.services.hf_inference import run_text_classification

router = APIRouter()


class PredictRequest(BaseModel):
    inputs: str


class ClassificationResult(BaseModel):
    label: str
    score: float


class PredictionResponse(BaseModel):
    results: List[ClassificationResult]


@router.post(
    "/predict",
    status_code=200,
    response_model=PredictionResponse,
)
async def predict(
    request: PredictRequest, user: CurrentUser, db: AsyncClient = Depends(get_db)
):
    """Test HuggingFace Serverless Inference API."""

    # Call the inference function
    result = await run_text_classification(request.inputs)

    # Log user to console
    print(f"User: {user}")

    # Save each classification result as a Report
    for classification in result:
        report_data = ReportCreate(
            title=classification.label, content=str(classification.score)
        )
        await crud_report.create(db, obj_in=report_data, user=user)

    # Return the result
    return PredictionResponse(results=result)
