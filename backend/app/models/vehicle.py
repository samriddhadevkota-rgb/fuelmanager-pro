from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.driver import Driver
    from app.models.transaction import Transaction


class Vehicle(BaseModel):
    __tablename__ = "vehicles"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    license_plate: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    make: Mapped[str] = mapped_column(String(100))
    model: Mapped[str] = mapped_column(String(100))
    year: Mapped[int | None] = mapped_column()
    color: Mapped[str | None] = mapped_column(String(50))
    vin: Mapped[str | None] = mapped_column(String(50), unique=True)
    fuel_type: Mapped[str] = mapped_column(String(50), default="diesel")
    tank_capacity_liters: Mapped[float] = mapped_column(Numeric(8, 2), default=0.0)
    current_mileage_km: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    status: Mapped[str] = mapped_column(String(50), default="active")

    company: Mapped[Company] = relationship("Company", back_populates="vehicles")
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="vehicle")
    assigned_driver: Mapped[Driver | None] = relationship("Driver", back_populates="vehicle", uselist=False)
