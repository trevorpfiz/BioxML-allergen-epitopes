from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase._async.client import AsyncClient

from app.api.deps import CurrentUser, get_db
from app.crud.crud_job import crud_job
from app.schemas.conformational_b_prediction import ConformationalBPredictionCreate
from app.schemas.linear_b_prediction import LinearBPredictionCreate
from app.schemas.mhc_i_prediction import MhcIPredictionCreate
from app.schemas.mhc_ii_prediction import MhcIIPredictionCreate
from app.services.background_tasks import process_and_update_prediction

router = APIRouter()


class PredictionProcessingResponse(BaseModel):
    message: str
    job_id: str


# Endpoint for Conformational B prediction
@router.post(
    "/conformational-b/", response_model=PredictionProcessingResponse, status_code=201
)
async def create_conformational_b_prediction(
    prediction_in: ConformationalBPredictionCreate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=prediction_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add prediction to this job"
        )

    await process_and_update_prediction(
        job_id=job.id,
        sequence=prediction_in.sequence,
        pdb_id=prediction_in.pdb_id,
        chain=prediction_in.chain,
        is_structure_based=prediction_in.is_structure_based,
        prediction_type="conformational-b",
        user_id=user.id,
        db=db,
    )

    return {"message": "Prediction processing completed", "job_id": job.id}


# Endpoint for Linear B prediction
@router.post("/linear-b/", response_model=PredictionProcessingResponse, status_code=201)
async def create_linear_b_prediction(
    prediction_in: LinearBPredictionCreate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=prediction_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add prediction to this job"
        )

    await process_and_update_prediction(
        job_id=job.id,
        sequence=prediction_in.sequence,
        prediction_type="linear-b",
        user_id=user.id,
        db=db,
    )

    return {"message": "Prediction processing completed", "job_id": job.id}


# Endpoint for MHC-I prediction
@router.post("/mhc-i/", response_model=PredictionProcessingResponse, status_code=201)
async def create_mhc_i_prediction(
    prediction_in: MhcIPredictionCreate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=prediction_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add prediction to this job"
        )

    await process_and_update_prediction(
        job_id=job.id,
        sequence=prediction_in.sequence,
        alleles=prediction_in.alleles,
        prediction_type="mhc-i",
        user_id=user.id,
        db=db,
    )

    return {"message": "Prediction processing completed", "job_id": job.id}


# Endpoint for MHC-II prediction
@router.post("/mhc-ii/", response_model=PredictionProcessingResponse, status_code=201)
async def create_mhc_ii_prediction(
    prediction_in: MhcIIPredictionCreate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=prediction_in.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.profile_id != user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to add prediction to this job"
        )

    await process_and_update_prediction(
        job_id=job.id,
        sequence=prediction_in.sequence,
        alleles=prediction_in.alleles,
        prediction_type="mhc-ii",
        user_id=user.id,
        db=db,
    )

    return {"message": "Prediction processing completed", "job_id": job.id}
