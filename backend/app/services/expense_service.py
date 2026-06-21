from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.expense import Expense
from app.repositories.expense_repository import ExpenseRepository
from app.schemas.base import AppBaseModel
from pydantic import Field
from datetime import date


class ExpenseCreate(AppBaseModel):
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=500)
    amount: float = Field(gt=0)
    expense_date: date
    vendor: str | None = None
    payment_method: str = "cash"
    reference_number: str | None = None
    notes: str | None = None
    is_recurring: bool = False


class ExpenseUpdate(AppBaseModel):
    category: str | None = None
    description: str | None = None
    amount: float | None = None
    expense_date: date | None = None
    vendor: str | None = None
    notes: str | None = None


logger = structlog.get_logger(__name__)


class ExpenseService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = ExpenseRepository(session)

    async def create(self, company_id: UUID, data: ExpenseCreate) -> Expense:
        expense = await self.repo.create({"company_id": company_id, **data.model_dump()})
        from app.services.dashboard_service import DashboardService
        await DashboardService(self.session).invalidate_cache(company_id)
        logger.info("expense_created", expense_id=str(expense.id), amount=data.amount)
        return expense

    async def get(self, id: UUID, company_id: UUID) -> Expense:
        expense = await self.repo.get_by_id(id, company_id)
        if not expense:
            raise NotFoundError("Expense", str(id))
        return expense

    async def list(self, company_id: UUID, page: int = 1, per_page: int = 20, filters: dict | None = None) -> tuple[list[Expense], int]:
        return await self.repo.list(company_id=company_id, filters=filters, page=page, per_page=per_page)

    async def update(self, id: UUID, company_id: UUID, data: ExpenseUpdate) -> Expense:
        expense = await self.repo.get_by_id(id, company_id)
        if not expense:
            raise NotFoundError("Expense", str(id))
        return await self.repo.update(expense, data.model_dump(exclude_none=True))

    async def delete(self, id: UUID, company_id: UUID) -> None:
        expense = await self.repo.get_by_id(id, company_id)
        if not expense:
            raise NotFoundError("Expense", str(id))
        await self.repo.soft_delete(expense)
