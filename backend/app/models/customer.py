from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.invoice import Invoice
    from app.models.payment import Payment
    from app.models.transaction import Transaction


class Customer(BaseModel):
    __tablename__ = "customers"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), default="US")
    tax_id: Mapped[str | None] = mapped_column(String(100))
    credit_limit: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    credit_balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    notes: Mapped[str | None] = mapped_column(Text)
    customer_type: Mapped[str] = mapped_column(String(50), default="individual")

    company: Mapped[Company] = relationship("Company", back_populates="customers")
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="customer")
    invoices: Mapped[list[Invoice]] = relationship("Invoice", back_populates="customer")
    payments: Mapped[list[Payment]] = relationship("Payment", back_populates="customer")
