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
    ENV: str = Field(default="", env="ENV")
    BACKEND_CORS_ORIGINS: Union[List[AnyHttpUrl], List[str]] = Field(
        default=["http://localhost:3000"], env="BACKEND_CORS_ORIGINS"
    )

    # Validator to parse both comma-separated strings and lists from .env file
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            # Split the string by commas and remove whitespace
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError("Invalid format for BACKEND_CORS_ORIGINS")

    # Project details
    API_VERSION: str = "/api/v1"
    PROJECT_NAME: str = "Epitope Prediction Tools FastAPI"
    PROJECT_DESCRIPTION: str = "A simple FastAPI app"

    # Pydantic configuration to load environment variables from .env
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
