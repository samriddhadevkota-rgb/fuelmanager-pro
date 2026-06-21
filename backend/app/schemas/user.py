from __future__ import annotations

from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import AppBaseModel, TimestampSchema


class UserBase(AppBaseModel):
    email: EmailStr
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    phone: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    role_id: UUID | None = None


class UserUpdate(AppBaseModel):
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    phone: str | None = None
    avatar_url: str | None = None
    role_id: UUID | None = None


class UserResponse(TimestampSchema):
    email: str
    first_name: str
    last_name: str
    phone: str | None
    avatar_url: str | None
    is_verified: bool
    is_active: bool
    company_id: UUID
    role_id: UUID | None
    full_name: str


class ChangePasswordRequest(AppBaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
