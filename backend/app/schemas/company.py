from __future__ import annotations

from app.schemas.base import AppBaseModel, TimestampSchema


class CompanySettingsUpdate(AppBaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    tax_id: str | None = None
    currency: str | None = None
    timezone: str | None = None
    website: str | None = None
    tax_rate: float | None = None
    fuel_price_markup: float | None = None


class CompanyResponse(TimestampSchema):
    name: str
    slug: str
    email: str | None
    phone: str | None
    address: str | None
    city: str | None
    state: str | None
    country: str
    postal_code: str | None
    tax_id: str | None
    currency: str
    timezone: str
    website: str | None
    tax_rate: float
    fuel_price_markup: float
