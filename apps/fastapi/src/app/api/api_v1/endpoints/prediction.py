from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from openai import BaseModel
from supabase._async.client import AsyncClient

from app.api.deps import CurrentUser, get_db
from app.crud.crud_job import crud_job
from app.schemas.conformational_b_prediction import (
    ConformationalBPredictionCreate,
)
from app.services.background_tasks import process_and_update_prediction

router = APIRouter()


class PredictionProcessingResponse(BaseModel):
    message: str
    job_id: str


@router.post(
    "/conformational-b/", response_model=PredictionProcessingResponse, status_code=201
)
async def create_conformational_b_prediction(
    background_tasks: BackgroundTasks,
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

    # Add background task to process the prediction
    background_tasks.add_task(
        process_and_update_prediction,
        job_id=job.id,
        pdb_id=prediction_in.pdb_id,
        chain=prediction_in.chain,
        prediction_type="conformational-b",
        db=db,
    )

    # Return a confirmation response
    return {"message": "Prediction processing started", "job_id": job.id}
