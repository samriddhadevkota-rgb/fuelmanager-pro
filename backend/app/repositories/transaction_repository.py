from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.transaction import Transaction
from app.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Transaction)

    async def get_with_relations(self, id: UUID, company_id: UUID) -> Transaction | None:
        stmt = (
            select(Transaction)
            .options(
                selectinload(Transaction.customer),
                selectinload(Transaction.vehicle),
                selectinload(Transaction.driver),
                selectinload(Transaction.fuel_tank),
            )
            .where(Transaction.id == id, Transaction.company_id == company_id, Transaction.deleted_at.is_(None))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_revenue_by_day(self, company_id: UUID, start_date: date, end_date: date) -> list[dict]:
        stmt = (
            select(
                func.date(Transaction.created_at).label("day"),
                func.sum(Transaction.total_amount).label("revenue"),
                func.count(Transaction.id).label("count"),
            )
            .where(
                Transaction.company_id == company_id,
                Transaction.deleted_at.is_(None),
                Transaction.transaction_type == "sale",
                func.date(Transaction.created_at) >= start_date,
                func.date(Transaction.created_at) <= end_date,
            )
            .group_by(func.date(Transaction.created_at))
            .order_by(func.date(Transaction.created_at))
        )
        result = await self.session.execute(stmt)
        return [{"day": str(row.day), "revenue": float(row.revenue or 0), "count": row.count} for row in result]

    async def get_total_revenue(self, company_id: UUID, start_date: date, end_date: date) -> float:
        stmt = select(func.sum(Transaction.total_amount)).where(
            Transaction.company_id == company_id,
            Transaction.deleted_at.is_(None),
            Transaction.transaction_type == "sale",
            func.date(Transaction.created_at) >= start_date,
            func.date(Transaction.created_at) <= end_date,
        )
        result = await self.session.execute(stmt)
        return float(result.scalar_one() or 0)

    async def get_recent(self, company_id: UUID, limit: int = 10) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .options(selectinload(Transaction.customer), selectinload(Transaction.vehicle))
            .where(Transaction.company_id == company_id, Transaction.deleted_at.is_(None))
            .order_by(Transaction.created_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def next_reference_number(self, company_id: UUID) -> str:
        stmt = select(func.count(Transaction.id)).where(Transaction.company_id == company_id)
        result = await self.session.execute(stmt)
        count = result.scalar_one()
        return f"TXN-{str(count + 1).zfill(6)}"
