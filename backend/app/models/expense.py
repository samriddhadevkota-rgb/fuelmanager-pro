from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company


class Expense(BaseModel):
    __tablename__ = "expenses"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    vendor: Mapped[str | None] = mapped_column(String(255))
    receipt_url: Mapped[str | None] = mapped_column(String(500))
    reference_number: Mapped[str | None] = mapped_column(String(100))
    payment_method: Mapped[str] = mapped_column(String(50), default="cash")
    is_recurring: Mapped[bool] = mapped_column(default=False)
    notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="approved", index=True)

    company: Mapped[Company] = relationship("Company", back_populates="expenses")
