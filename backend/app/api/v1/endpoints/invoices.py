from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.invoice import InvoiceCreate, InvoiceResponse, InvoiceUpdate
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("", response_model=PaginatedResponse[InvoiceResponse])
async def list_invoices(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
) -> PaginatedResponse[InvoiceResponse]:
    svc = InvoiceService(db)
    filters = {"status": status_filter} if status_filter else None
    items, total = await svc.list(company_id, page=page, per_page=per_page, filters=filters)
    return PaginatedResponse.create(
        data=[InvoiceResponse.model_validate(i) for i in items],
        total=total, page=page, per_page=per_page,
    )


@router.post("", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(data: InvoiceCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> InvoiceResponse:
    svc = InvoiceService(db)
    invoice = await svc.create(company_id, data)
    return InvoiceResponse.model_validate(invoice)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> InvoiceResponse:
    svc = InvoiceService(db)
    invoice = await svc.get(invoice_id, company_id)
    return InvoiceResponse.model_validate(invoice)


@router.patch("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(invoice_id: UUID, data: InvoiceUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> InvoiceResponse:
    svc = InvoiceService(db)
    invoice = await svc.update(invoice_id, company_id, data)
    return InvoiceResponse.model_validate(invoice)


@router.post("/{invoice_id}/send", response_model=InvoiceResponse)
async def send_invoice(invoice_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> InvoiceResponse:
    svc = InvoiceService(db)
    invoice = await svc.send(invoice_id, company_id)
    return InvoiceResponse.model_validate(invoice)


@router.delete("/{invoice_id}", response_model=MessageResponse)
async def delete_invoice(invoice_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = InvoiceService(db)
    await svc.delete(invoice_id, company_id)
    return MessageResponse(message="Invoice deleted successfully")
