from fastapi import APIRouter, Depends, HTTPException
from supabase._async.client import AsyncClient

from app.api.deps import CurrentUser, get_db
from app.crud.crud_conformational_b_prediction import crud_conformational_b_prediction
from app.crud.crud_job import crud_job
from app.schemas.conformational_b_prediction import (
    ConformationalBPrediction,
    ConformationalBPredictionCreate,
    ConformationalBPredictionUpdate,
)
from app.services.conformational_b import process_conformational_b_prediction

router = APIRouter()


# Create Conformational B Prediction
@router.post("/", response_model=ConformationalBPrediction, status_code=201)
async def create_conformational_b_prediction(
    prediction_in: ConformationalBPredictionCreate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    # Ensure the job exists and belongs to the user
    job = await crud_job.get(db=db, id=prediction_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add prediction to this job"
        )

    # Process the prediction (read CSV, save results)
    results = await process_conformational_b_prediction(
        pdb_id=prediction_in.pdb_id,
        chain=prediction_in.chain,
    )

    # Save the processed prediction results
    updated_prediction = await crud_conformational_b_prediction.update_result(
        db=db, job_id=prediction_in.job_id, result=results
    )

    return updated_prediction


# Get Conformational B Prediction
@router.get(
    "/{id}",
    response_model=ConformationalBPrediction,
    tags=["Conformational B Predictions"],
)
async def get_conformational_b_prediction(
    id: str,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    prediction = await crud_conformational_b_prediction.get(db=db, id=id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Ensure the user has access to this prediction
    job = await crud_job.get(db=db, id=prediction.job_id)
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this prediction"
        )

    return prediction


# Update Conformational B Prediction
@router.put(
    "/{id}",
    response_model=ConformationalBPrediction,
    tags=["Conformational B Predictions"],
)
async def update_conformational_b_prediction(
    id: str,
    prediction_update: ConformationalBPredictionUpdate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    prediction = await crud_conformational_b_prediction.get(db=db, id=id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    job = await crud_job.get(db=db, id=prediction.job_id)
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this prediction"
        )

    # Update the prediction's result
    updated_prediction = await crud_conformational_b_prediction.update_result(
        db=db, job_id=prediction.job_id, result=prediction_update.result
    )
    return updated_prediction


# Delete Conformational B Prediction
@router.delete(
    "/{id}",
    response_model=ConformationalBPrediction,
    tags=["Conformational B Predictions"],
)
async def delete_conformational_b_prediction(
    id: str,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    prediction = await crud_conformational_b_prediction.get(db=db, id=id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    job = await crud_job.get(db=db, id=prediction.job_id)
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this prediction"
        )

    deleted_prediction = await crud_conformational_b_prediction.delete(db=db, id=id)
    return deleted_prediction
