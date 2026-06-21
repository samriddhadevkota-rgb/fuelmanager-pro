from __future__ import annotations

from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class AppBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TimestampSchema(AppBaseModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class PaginatedResponse(AppBaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    per_page: int
    total_pages: int

    @classmethod
    def create(cls, data: list[T], total: int, page: int, per_page: int) -> PaginatedResponse[T]:
        total_pages = (total + per_page - 1) // per_page if per_page > 0 else 0
        return cls(data=data, total=total, page=page, per_page=per_page, total_pages=total_pages)


class MessageResponse(AppBaseModel):
    message: str


class ErrorResponse(AppBaseModel):
    error: str
    detail: str | None = None
    code: str | None = None
