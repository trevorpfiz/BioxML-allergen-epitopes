from fastapi import APIRouter

from app.api.api_v1.endpoints import prediction

api_router = APIRouter()


api_router.include_router(
    prediction.router,
    prefix="/prediction",
    tags=["prediction"],
    responses={404: {"description": "Not found"}},
)
