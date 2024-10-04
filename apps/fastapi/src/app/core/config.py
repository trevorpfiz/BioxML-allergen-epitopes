import logging

from dotenv import load_dotenv
from pydantic import Field
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
    BACKEND_CORS_ORIGINS = ["http://localhost:3000"]

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
