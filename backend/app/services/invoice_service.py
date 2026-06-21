from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.invoice import Invoice, InvoiceLineItem
from app.repositories.customer_repository import CustomerRepository
from app.repositories.invoice_repository import InvoiceRepository
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate

logger = structlog.get_logger(__name__)


class InvoiceService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = InvoiceRepository(session)
        self.customer_repo = CustomerRepository(session)

    async def create(self, company_id: UUID, data: InvoiceCreate) -> Invoice:
        customer = await self.customer_repo.get_by_id(data.customer_id, company_id)
        if not customer:
            raise NotFoundError("Customer", str(data.customer_id))

        subtotal = sum(item.quantity * item.unit_price for item in data.line_items)
        tax_amount = round(subtotal * data.tax_rate / 100, 2)
        total_amount = round(subtotal - data.discount_amount + tax_amount, 2)
        invoice_number = await self.repo.next_invoice_number(company_id)

        invoice = await self.repo.create({
            "company_id": company_id,
            "customer_id": data.customer_id,
            "invoice_number": invoice_number,
            "status": "draft",
            "issue_date": data.issue_date,
            "due_date": data.due_date,
            "subtotal": subtotal,
            "tax_rate": data.tax_rate,
            "tax_amount": tax_amount,
            "discount_amount": data.discount_amount,
            "total_amount": total_amount,
            "notes": data.notes,
            "terms": data.terms,
        })

        for item in data.line_items:
            line_item = InvoiceLineItem(
                invoice_id=invoice.id,
                description=item.description,
                quantity=item.quantity,
                unit=item.unit,
                unit_price=item.unit_price,
                total=round(item.quantity * item.unit_price, 2),
            )
            self.session.add(line_item)

        await self.session.flush()

        from app.workers.tasks.invoice_tasks import generate_invoice_pdf
        generate_invoice_pdf.delay(str(invoice.id))

        logger.info("invoice_created", invoice_id=str(invoice.id), number=invoice_number, company_id=str(company_id))
        return invoice

    async def get(self, id: UUID, company_id: UUID) -> Invoice:
        invoice = await self.repo.get_with_relations(id, company_id)
        if not invoice:
            raise NotFoundError("Invoice", str(id))
        return invoice

    async def list(
        self,
        company_id: UUID,
        page: int = 1,
        per_page: int = 20,
        filters: dict | None = None,
    ) -> tuple[list[Invoice], int]:
        return await self.repo.list(company_id=company_id, filters=filters, page=page, per_page=per_page)

    async def update(self, id: UUID, company_id: UUID, data: InvoiceUpdate) -> Invoice:
        invoice = await self.repo.get_by_id(id, company_id)
        if not invoice:
            raise NotFoundError("Invoice", str(id))
        update_data = data.model_dump(exclude_none=True)
        return await self.repo.update(invoice, update_data)

    async def send(self, id: UUID, company_id: UUID) -> Invoice:
        invoice = await self.repo.get_with_relations(id, company_id)
        if not invoice:
            raise NotFoundError("Invoice", str(id))
        if invoice.status not in ("draft",):
            from app.core.exceptions import BusinessRuleError
            raise BusinessRuleError(f"Cannot send invoice with status '{invoice.status}'")
        await self.repo.update(invoice, {"status": "sent"})
        from app.workers.tasks.email_tasks import send_invoice_email
        send_invoice_email.delay(str(invoice.id))
        return invoice

    async def delete(self, id: UUID, company_id: UUID) -> None:
        invoice = await self.repo.get_by_id(id, company_id)
        if not invoice:
            raise NotFoundError("Invoice", str(id))
        await self.repo.soft_delete(invoice)
