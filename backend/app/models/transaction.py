from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.customer import Customer
    from app.models.driver import Driver
    from app.models.fuel_tank import FuelTank
    from app.models.vehicle import Vehicle


class Transaction(BaseModel):
    __tablename__ = "transactions"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    driver_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("drivers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fuel_tank_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("fuel_tanks.id", ondelete="SET NULL"), nullable=True, index=True
    )

    transaction_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    reference_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    fuel_type: Mapped[str | None] = mapped_column(String(50), index=True)
    quantity_liters: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="cash")
    payment_status: Mapped[str] = mapped_column(String(50), default="paid", index=True)
    mileage_km: Mapped[float | None] = mapped_column(Numeric(12, 2))
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="completed", index=True)

    company: Mapped[Company] = relationship("Company", back_populates="transactions")
    customer: Mapped[Customer | None] = relationship("Customer", back_populates="transactions")
    vehicle: Mapped[Vehicle | None] = relationship("Vehicle", back_populates="transactions")
    driver: Mapped[Driver | None] = relationship("Driver", back_populates="transactions")
    fuel_tank: Mapped[FuelTank | None] = relationship("FuelTank", back_populates="transactions")
