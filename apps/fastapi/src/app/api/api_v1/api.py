from fastapi import APIRouter

from app.api.api_v1.endpoints import health, job, prediction

api_router = APIRouter()


api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    job.router,
    prefix="/job",
    tags=["job"],
    responses={404: {"description": "Not found"}},
)

api_router.include_router(
    prediction.router,
    prefix="/prediction",
    tags=["prediction"],
    responses={404: {"description": "Not found"}},
)
