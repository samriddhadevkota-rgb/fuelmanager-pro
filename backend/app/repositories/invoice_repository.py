from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.invoice import Invoice, InvoiceLineItem
from app.repositories.base import BaseRepository


class InvoiceRepository(BaseRepository[Invoice]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Invoice)

    async def get_with_relations(self, id: UUID, company_id: UUID) -> Invoice | None:
        stmt = (
            select(Invoice)
            .options(selectinload(Invoice.customer), selectinload(Invoice.line_items), selectinload(Invoice.payments))
            .where(Invoice.id == id, Invoice.company_id == company_id, Invoice.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def next_invoice_number(self, company_id: UUID) -> str:
        stmt = select(func.count(Invoice.id)).where(Invoice.company_id == company_id)
        result = await self.session.execute(stmt)
        count = result.scalar_one()
        return f"INV-{str(count + 1).zfill(5)}"

    async def get_overdue(self, company_id: UUID) -> list[Invoice]:
        from datetime import date
        stmt = select(Invoice).where(
            Invoice.company_id == company_id,
            Invoice.deleted_at.is_(None),
            Invoice.status.in_(["sent", "partial"]),
            Invoice.due_date < date.today(),
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
