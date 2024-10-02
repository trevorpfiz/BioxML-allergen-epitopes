from fastapi import APIRouter

from app.api.api_v1.endpoints import health, hf

api_router = APIRouter()


api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
    responses={404: {"description": "Not found"}},
)
api_router.include_router(
    hf.router,
    prefix="/hf",
    tags=["hf"],
    responses={404: {"description": "Not found"}},
)
