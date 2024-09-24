from fastapi import APIRouter

from api.endpoints.v1.routers import health

api_router = APIRouter()


api_router.include_router(
    health.router,
    prefix="/health",
    tags=["health"],
    responses={404: {"description": "Not found"}},
)

