import logging
from typing import List, Union

from dotenv import load_dotenv
from pydantic import AnyHttpUrl, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

log_format = logging.Formatter("%(asctime)s : %(levelname)s - %(message)s")

# root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# standard stream handler
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(log_format)
root_logger.addHandler(stream_handler)

logger = logging.getLogger(__name__)

load_dotenv()


class Settings(BaseSettings):
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    BACKEND_CORS_ORIGINS: list[AnyHttpUrl] = [
        "http://localhost:3000/"
    ]  # TODO: Change to your production URL

    # Validator to ensure BACKEND_CORS_ORIGINS is parsed correctly
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            # If a comma-separated string is provided, split it into a list
            return [i.strip() for i in v.split(",")]
        return v

    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., env="SUPABASE_KEY")
    SUPERUSER_EMAIL: str = Field(..., env="SUPERUSER_EMAIL")
    SUPERUSER_PASSWORD: str = Field(..., env="SUPERUSER_PASSWORD")
    JWT_SECRET: str = Field(..., env="JWT_SECRET")

    # Optional
    HUGGINGFACE_ACCESS_TOKEN: str = Field(None, env="HUGGINGFACE_ACCESS_TOKEN")
    OPENAI_API_KEY: str = Field(None, env="OPENAI_API_KEY")

    # Project details
    API_VERSION: str = "/api/v1"
    PROJECT_NAME: str = "FastAPI App"
    PROJECT_DESCRIPTION: str = "A simple FastAPI app"

    # Pydantic configuration to load environment variables from .env
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
