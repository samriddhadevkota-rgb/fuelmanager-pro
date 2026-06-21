from __future__ import annotations

from pydantic import EmailStr, Field

from app.schemas.base import AppBaseModel, TimestampSchema


class CustomerCreate(AppBaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str = "US"
    tax_id: str | None = None
    credit_limit: float = 0.0
    notes: str | None = None
    customer_type: str = "individual"


class CustomerUpdate(AppBaseModel):
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    tax_id: str | None = None
    credit_limit: float | None = None
    notes: str | None = None
    customer_type: str | None = None


class CustomerResponse(TimestampSchema):
    name: str
    email: str | None
    phone: str | None
    address: str | None
    city: str | None
    state: str | None
    country: str
    tax_id: str | None
    credit_limit: float
    credit_balance: float
    notes: str | None
    customer_type: str
    is_active: bool
