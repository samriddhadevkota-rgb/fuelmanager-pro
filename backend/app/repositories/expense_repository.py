from __future__ import annotations

from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.expense import Expense
from app.repositories.base import BaseRepository


class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Expense)

    async def get_total_expenses(self, company_id: UUID, start_date: date, end_date: date) -> float:
        stmt = select(func.sum(Expense.amount)).where(
            Expense.company_id == company_id,
            Expense.deleted_at.is_(None),
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date,
        )
        result = await self.session.execute(stmt)
        return float(result.scalar_one() or 0)

    async def get_by_category(self, company_id: UUID, start_date: date, end_date: date) -> list[dict]:
        stmt = (
            select(Expense.category, func.sum(Expense.amount).label("total"))
            .where(
                Expense.company_id == company_id,
                Expense.deleted_at.is_(None),
                Expense.expense_date >= start_date,
                Expense.expense_date <= end_date,
            )
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
        )
        result = await self.session.execute(stmt)
        return [{"category": row.category, "total": float(row.total or 0)} for row in result]
