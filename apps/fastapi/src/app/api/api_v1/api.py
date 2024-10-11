from fastapi import APIRouter

from app.api.api_v1.endpoints import conformational_b_prediction, health, job

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
    conformational_b_prediction.router,
    prefix="/conformationalBPrediction",
    tags=["conformational_b_prediction"],
    responses={404: {"description": "Not found"}},
)
