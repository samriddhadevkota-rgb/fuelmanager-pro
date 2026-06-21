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
    from app.models.customer import Customer
    from app.models.payment import Payment


class Invoice(BaseModel):
    __tablename__ = "invoices"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    invoice_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="draft", index=True)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    amount_paid: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0)
    notes: Mapped[str | None] = mapped_column(Text)
    terms: Mapped[str | None] = mapped_column(Text)
    pdf_url: Mapped[str | None] = mapped_column(String(500))

    company: Mapped[Company] = relationship("Company", back_populates="invoices")
    customer: Mapped[Customer] = relationship("Customer", back_populates="invoices")
    line_items: Mapped[list[InvoiceLineItem]] = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")
    payments: Mapped[list[Payment]] = relationship("Payment", back_populates="invoice")

    @property
    def amount_due(self) -> float:
        return round(self.total_amount - self.amount_paid, 2)


class InvoiceLineItem(BaseModel):
    __tablename__ = "invoice_line_items"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    quantity: Mapped[float] = mapped_column(Numeric(12, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), default="liters")
    unit_price: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    invoice: Mapped[Invoice] = relationship("Invoice", back_populates="line_items")
