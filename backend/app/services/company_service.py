from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.company import Company
from app.schemas.company import CompanySettingsUpdate

logger = structlog.get_logger(__name__)


class CompanyService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, company_id: UUID) -> Company:
        result = await self.session.execute(
            select(Company).where(Company.id == company_id, Company.deleted_at.is_(None))
        )
        company = result.scalar_one_or_none()
        if not company:
            raise NotFoundError("Company", str(company_id))
        return company

    async def update(self, company_id: UUID, data: CompanySettingsUpdate) -> Company:
        company = await self.get(company_id)
        for field, value in data.model_dump(exclude_none=True).items():
            setattr(company, field, value)
        await self.session.commit()
        await self.session.refresh(company)
        logger.info("company_settings_updated", company_id=str(company_id))
        return company

    async def get_pl_summary(self, company_id: UUID, year: int, month: int | None) -> dict:
        from sqlalchemy import extract, func
        from app.models.transaction import Transaction
        from app.models.expense import Expense

        rev_q = select(func.coalesce(func.sum(Transaction.total_amount), 0)).where(
            Transaction.company_id == company_id,
            Transaction.transaction_type == "sale",
            Transaction.deleted_at.is_(None),
            extract("year", Transaction.created_at) == year,
        )
        exp_q = select(func.coalesce(func.sum(Expense.amount), 0)).where(
            Expense.company_id == company_id,
            Expense.deleted_at.is_(None),
            extract("year", Expense.expense_date) == year,
        )
        if month:
            rev_q = rev_q.where(extract("month", Transaction.created_at) == month)
            exp_q = exp_q.where(extract("month", Expense.expense_date) == month)

        revenue = float((await self.session.execute(rev_q)).scalar_one())
        expenses = float((await self.session.execute(exp_q)).scalar_one())

        # Monthly breakdown
        monthly_q = (
            select(
                extract("month", Transaction.created_at).label("month"),
                func.coalesce(func.sum(Transaction.total_amount), 0).label("revenue"),
            )
            .where(
                Transaction.company_id == company_id,
                Transaction.transaction_type == "sale",
                Transaction.deleted_at.is_(None),
                extract("year", Transaction.created_at) == year,
            )
            .group_by(extract("month", Transaction.created_at))
            .order_by(extract("month", Transaction.created_at))
        )
        monthly_exp_q = (
            select(
                extract("month", Expense.expense_date).label("month"),
                func.coalesce(func.sum(Expense.amount), 0).label("expenses"),
            )
            .where(
                Expense.company_id == company_id,
                Expense.deleted_at.is_(None),
                extract("year", Expense.expense_date) == year,
            )
            .group_by(extract("month", Expense.expense_date))
            .order_by(extract("month", Expense.expense_date))
        )

        rev_rows = {int(r.month): float(r.revenue) for r in (await self.session.execute(monthly_q)).all()}
        exp_rows = {int(r.month): float(r.expenses) for r in (await self.session.execute(monthly_exp_q)).all()}

        MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        monthly = [
            {
                "month": MONTHS[m - 1],
                "revenue": rev_rows.get(m, 0),
                "expenses": exp_rows.get(m, 0),
                "profit": rev_rows.get(m, 0) - exp_rows.get(m, 0),
            }
            for m in range(1, 13)
        ]

        return {
            "year": year,
            "revenue": revenue,
            "expenses": expenses,
            "gross_profit": revenue - expenses,
            "margin_pct": round((revenue - expenses) / revenue * 100, 1) if revenue else 0,
            "monthly": monthly,
        }
