from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.transaction import Transaction
    from app.models.vehicle import Vehicle


class Driver(BaseModel):
    __tablename__ = "drivers"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    vehicle_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    license_number: Mapped[str | None] = mapped_column(String(100))
    license_expiry: Mapped[str | None] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(50), default="active")
    employee_id: Mapped[str | None] = mapped_column(String(100))

    company: Mapped[Company] = relationship("Company", back_populates="drivers")
    vehicle: Mapped[Vehicle | None] = relationship("Vehicle", back_populates="assigned_driver")
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="driver")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
