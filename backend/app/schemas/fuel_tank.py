from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.schemas.base import AppBaseModel, TimestampSchema


class FuelTankCreate(AppBaseModel):
    name: str = Field(min_length=1, max_length=255)
    fuel_type: str
    capacity_liters: float = Field(gt=0)
    current_level_liters: float = 0.0
    low_level_threshold_pct: float = 20.0
    location: str | None = None
    notes: str | None = None


class FuelTankUpdate(AppBaseModel):
    name: str | None = None
    fuel_type: str | None = None
    capacity_liters: float | None = None
    current_level_liters: float | None = None
    low_level_threshold_pct: float | None = None
    location: str | None = None
    notes: str | None = None


class FuelTankResponse(TimestampSchema):
    name: str
    fuel_type: str
    capacity_liters: float
    current_level_liters: float
    low_level_threshold_pct: float
    location: str | None
    notes: str | None
    last_refill_at: datetime | None
    level_percentage: float
    is_low: bool
    is_active: bool


class TankRefillCreate(AppBaseModel):
    liters_added: float = Field(gt=0)
    cost_per_liter: float = Field(gt=0)
    total_cost: float = Field(gt=0)
    supplier: str | None = None
    invoice_number: str | None = None
    refilled_by: str | None = None
    notes: str | None = None


class TankRefillResponse(TimestampSchema):
    tank_id: str
    liters_added: float
    cost_per_liter: float
    total_cost: float
    supplier: str | None
    invoice_number: str | None
    refilled_by: str | None
    notes: str | None
