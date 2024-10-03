import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from mangum import Mangum

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.core.events import lifespan

info_router = APIRouter()


@info_router.get("/", status_code=200, include_in_schema=False)
async def info():
    return [{"Status": "API Runninggg"}]


test_router = APIRouter()


@test_router.get("/test", status_code=200)
async def test_route():
    return {"message": "This is a test route!"}


def custom_generate_unique_id(route: APIRoute):
    """Generates a custom ID when using the TypeScript Generator Client

    Args:
        route (APIRoute): The route to be customised

    Returns:
        str: tag-route_name, e.g. items-CreateItem
    """
    return f"{route.tags[0]}-{route.name}"


def get_application():
    _app = FastAPI(
        lifespan=lifespan,
        title=settings.PROJECT_NAME,
        description=settings.PROJECT_DESCRIPTION,
        generate_unique_id_function=custom_generate_unique_id,
        openapi_url=f"{settings.API_VERSION}/openapi.json",
    )

    if settings.ENVIRONMENT == "development":
        logger = logging.getLogger("uvicorn")
        logger.warning("Running in development mode - allowing CORS for all origins")
        _app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        _app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    _app.include_router(api_router, prefix=settings.API_VERSION)
    _app.include_router(info_router, tags=[""])
    _app.include_router(test_router, tags=["Test"])

    return _app


app = get_application()

handler = Mangum(app=app, lifespan="auto")
