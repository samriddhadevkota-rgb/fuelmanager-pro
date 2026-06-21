from __future__ import annotations

from datetime import date
from uuid import UUID

from pydantic import Field

from app.schemas.base import AppBaseModel, TimestampSchema


class InvoiceLineItemCreate(AppBaseModel):
    description: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    unit: str = "liters"
    unit_price: float = Field(ge=0)


class InvoiceLineItemResponse(TimestampSchema):
    description: str
    quantity: float
    unit: str
    unit_price: float
    total: float


class InvoiceCreate(AppBaseModel):
    customer_id: UUID
    issue_date: date
    due_date: date
    tax_rate: float = 0.0
    discount_amount: float = 0.0
    notes: str | None = None
    terms: str | None = None
    line_items: list[InvoiceLineItemCreate] = Field(min_length=1)


class InvoiceUpdate(AppBaseModel):
    status: str | None = None
    due_date: date | None = None
    notes: str | None = None
    terms: str | None = None


class InvoiceResponse(TimestampSchema):
    invoice_number: str
    customer_id: UUID
    status: str
    issue_date: date
    due_date: date
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    amount_paid: float
    amount_due: float
    notes: str | None
    terms: str | None
    pdf_url: str | None
    is_active: bool
    line_items: list[InvoiceLineItemResponse] = []
