from __future__ import annotations

from uuid import UUID

from pydantic import Field

from app.schemas.base import AppBaseModel, TimestampSchema


class TransactionCreate(AppBaseModel):
    customer_id: UUID | None = None
    vehicle_id: UUID | None = None
    driver_id: UUID | None = None
    fuel_tank_id: UUID | None = None
    transaction_type: str = Field(pattern="^(sale|purchase|refund|adjustment)$")
    fuel_type: str | None = None
    quantity_liters: float = Field(ge=0)
    unit_price: float = Field(ge=0)
    payment_method: str = "cash"
    mileage_km: float | None = None
    notes: str | None = None


class TransactionUpdate(AppBaseModel):
    payment_status: str | None = None
    status: str | None = None
    notes: str | None = None


class TransactionResponse(TimestampSchema):
    reference_number: str
    transaction_type: str
    fuel_type: str | None
    quantity_liters: float
    unit_price: float
    subtotal: float
    tax_amount: float
    total_amount: float
    payment_method: str
    payment_status: str
    mileage_km: float | None
    notes: str | None
    status: str
    customer_id: UUID | None
    vehicle_id: UUID | None
    driver_id: UUID | None
    fuel_tank_id: UUID | None
