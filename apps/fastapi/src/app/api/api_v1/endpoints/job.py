from fastapi import APIRouter, Depends, HTTPException
from supabase._async.client import AsyncClient

from app.api.deps import CurrentUser, get_db
from app.crud.crud_job import crud_job
from app.schemas.job import Job, JobCreate, JobUpdate

router = APIRouter()


# Create a new job
@router.post(
    "/",
    response_model=Job,
    status_code=201,
    tags=["Jobs"],
)
async def create_job(
    job_in: JobCreate,
    user: CurrentUser,  # Inject current authenticated user
    db: AsyncClient = Depends(get_db),
):
    try:
        # Create the job using the current user's profile
        job = await crud_job.create(db=db, obj_in=job_in, user=user)
        return job
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update an existing job
@router.put(
    "/{id}",
    response_model=Job,
    tags=["Jobs"],
)
async def update_job(
    id: str,
    job_update: JobUpdate,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    try:
        # Update the job if it belongs to the current user
        updated_job = await crud_job.update(db=db, obj_in=job_update, id=id, user=user)
        return updated_job
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Get a specific job by ID
@router.get(
    "/{id}",
    response_model=Job,
    tags=["Jobs"],
)
async def get_job(
    id: str,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Optionally, check that the job belongs to the current user
    if job.profile_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this job")

    return job


# Get all jobs for the current user
@router.get(
    "/",
    response_model=list[Job],
    tags=["Jobs"],
)
async def get_user_jobs(
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    jobs = await crud_job.get_all(db=db)
    user_jobs = [job for job in jobs if job.profile_id == user.id]
    return user_jobs


# Delete a job by ID
@router.delete(
    "/{id}",
    response_model=Job,
    tags=["Jobs"],
)
async def delete_job(
    id: str,
    user: CurrentUser,
    db: AsyncClient = Depends(get_db),
):
    job = await crud_job.get(db=db, id=id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Ensure the user owns the job
    if job.profile_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this job")

    deleted_job = await crud_job.delete(db=db, id=id)
    return deleted_job
