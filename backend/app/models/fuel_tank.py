from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.transaction import Transaction


class FuelTank(BaseModel):
    __tablename__ = "fuel_tanks"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    fuel_type: Mapped[str] = mapped_column(String(50), nullable=False)
    capacity_liters: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    current_level_liters: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    low_level_threshold_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=20.0)
    location: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)
    last_refill_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    company: Mapped[Company] = relationship("Company", back_populates="fuel_tanks")
    refills: Mapped[list[TankRefill]] = relationship("TankRefill", back_populates="tank")
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="fuel_tank")

    @property
    def level_percentage(self) -> float:
        if self.capacity_liters == 0:
            return 0.0
        return round((self.current_level_liters / self.capacity_liters) * 100, 2)

    @property
    def is_low(self) -> bool:
        return self.level_percentage < self.low_level_threshold_pct


class TankRefill(BaseModel):
    __tablename__ = "tank_refills"

    tank_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fuel_tanks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    liters_added: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    cost_per_liter: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    total_cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    supplier: Mapped[str | None] = mapped_column(String(255))
    invoice_number: Mapped[str | None] = mapped_column(String(100))
    refilled_by: Mapped[str | None] = mapped_column(String(255))
    notes: Mapped[str | None] = mapped_column(Text)

    tank: Mapped[FuelTank] = relationship("FuelTank", back_populates="refills")
