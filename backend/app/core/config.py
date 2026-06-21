from __future__ import annotations

import json
from functools import lru_cache
from typing import Any

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "FuelManager Pro"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    REDIS_URL: str = "redis://redis:6379/0"
    RABBITMQ_URL: str = "amqp://guest:guest@rabbitmq:5672/"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    SECRET_KEY: str

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = "noreply@fuelmanager.com"
    EMAILS_FROM_NAME: str = "FuelManager Pro"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:80"]

    CACHE_TTL_SECONDS: int = 300
    DASHBOARD_CACHE_TTL: int = 300
    RATE_LIMIT_PER_MINUTE: int = 60

    MEDIA_ROOT: str = "/app/media"

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            return json.loads(v)
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def celery_broker_url(self) -> str:
        return self.RABBITMQ_URL

    @property
    def celery_result_backend(self) -> str:
        return self.REDIS_URL


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
