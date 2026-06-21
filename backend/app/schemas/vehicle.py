from __future__ import annotations

from pydantic import Field

from app.schemas.base import AppBaseModel, TimestampSchema


class VehicleCreate(AppBaseModel):
    license_plate: str = Field(min_length=1, max_length=50)
    make: str | None = None
    model: str | None = None
    year: int | None = None
    color: str | None = None
    vin: str | None = None
    fuel_type: str = "diesel"
    tank_capacity_liters: float = 0.0
    current_mileage_km: float = 0.0
    status: str = "active"


class VehicleUpdate(AppBaseModel):
    license_plate: str | None = None
    make: str | None = None
    model: str | None = None
    year: int | None = None
    color: str | None = None
    fuel_type: str | None = None
    tank_capacity_liters: float | None = None
    current_mileage_km: float | None = None
    status: str | None = None


class VehicleResponse(TimestampSchema):
    license_plate: str
    make: str | None
    model: str | None
    year: int | None
    color: str | None
    vin: str | None
    fuel_type: str
    tank_capacity_liters: float
    current_mileage_km: float
    status: str
    is_active: bool
