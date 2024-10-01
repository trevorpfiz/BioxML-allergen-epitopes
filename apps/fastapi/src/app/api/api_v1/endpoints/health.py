from fastapi import APIRouter, Depends, HTTPException

from app.schemas.error import UnauthorizedErrorResponse
from app.schemas.health import HealthCheckResponse
from app.services.auth import verify_token

router = APIRouter()


@router.get(
    "",
    status_code=200,
    response_model=HealthCheckResponse,
    responses={401: {"model": UnauthorizedErrorResponse}},
)
async def check(user: str = Depends(verify_token)):
    """Secured health check endpoint."""
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    return HealthCheckResponse(
        message="Service is running smoothly",
        batches_processed=0,
        title="title",
        content="content",
        transcript="hi",
    )
