from __future__ import annotations

from pydantic import EmailStr, Field

from app.schemas.base import AppBaseModel, TimestampSchema


class DriverCreate(AppBaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr | None = None
    phone: str | None = None
    license_number: str | None = None
    license_expiry: str | None = None
    employee_id: str | None = None
    status: str = "active"
    vehicle_id: str | None = None


class DriverUpdate(AppBaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    license_number: str | None = None
    license_expiry: str | None = None
    employee_id: str | None = None
    status: str | None = None
    vehicle_id: str | None = None


class DriverResponse(TimestampSchema):
    first_name: str
    last_name: str
    full_name: str
    email: str | None
    phone: str | None
    license_number: str | None
    license_expiry: str | None
    employee_id: str | None
    status: str
    vehicle_id: str | None
    is_active: bool
