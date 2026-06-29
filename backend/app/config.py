from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    APP_NAME: str = "淘宝SOP运营工具"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/taobao_sop"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI API
    QWEN_API_KEY: Optional[str] = None
    QWEN_MODEL: str = "qwen-max"
    IMAGE_GEN_API_KEY: Optional[str] = None
    VIDEO_GEN_API_KEY: Optional[str] = None

    # Taobao
    TAOBAO_COOKIE: Optional[str] = None


settings = Settings()
