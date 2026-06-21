from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_get, cache_set
from app.core.config import settings
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.fuel_tank_repository import FuelTankRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.dashboard import (
    DashboardMetrics,
    MetricCard,
    RevenueDataPoint,
    TankLevelInfo,
)

logger = structlog.get_logger(__name__)


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.transaction_repo = TransactionRepository(session)
        self.expense_repo = ExpenseRepository(session)
        self.tank_repo = FuelTankRepository(session)

    async def get_metrics(self, company_id: UUID) -> DashboardMetrics:
        cache_key = f"dashboard:{company_id}"
        cached = await cache_get(cache_key)
        if cached:
            return DashboardMetrics(**cached)

        metrics = await self._compute_metrics(company_id)
        await cache_set(cache_key, metrics.model_dump(), ttl=settings.DASHBOARD_CACHE_TTL)
        return metrics

    async def _compute_metrics(self, company_id: UUID) -> DashboardMetrics:
        today = date.today()
        this_month_start = today.replace(day=1)
        last_month_end = this_month_start - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)
        thirty_days_ago = today - timedelta(days=30)

        current_revenue = await self.transaction_repo.get_total_revenue(company_id, this_month_start, today)
        prev_revenue = await self.transaction_repo.get_total_revenue(company_id, last_month_start, last_month_end)
        current_expenses = await self.expense_repo.get_total_expenses(company_id, this_month_start, today)
        prev_expenses = await self.expense_repo.get_total_expenses(company_id, last_month_start, last_month_end)

        current_profit = current_revenue - current_expenses
        prev_profit = prev_revenue - prev_expenses

        def pct_change(current: float, previous: float) -> float:
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            return round(((current - previous) / previous) * 100, 2)

        current_txn_count = await self.transaction_repo.count(company_id, {"transaction_type": "sale"})

        all_tanks, _ = await self.tank_repo.list(company_id, page=1, per_page=100)
        tank_levels = [
            TankLevelInfo(
                id=str(t.id),
                name=t.name,
                fuel_type=t.fuel_type,
                capacity_liters=float(t.capacity_liters),
                current_level_liters=float(t.current_level_liters),
                level_percentage=t.level_percentage,
                is_low=t.is_low,
            )
            for t in all_tanks
        ]
        low_stock_count = sum(1 for t in tank_levels if t.is_low)

        revenue_chart_raw = await self.transaction_repo.get_revenue_by_day(company_id, thirty_days_ago, today)
        revenue_chart = [RevenueDataPoint(**row) for row in revenue_chart_raw]

        recent_raw = await self.transaction_repo.get_recent(company_id, limit=10)
        recent_transactions = [
            {
                "id": str(t.id),
                "reference_number": t.reference_number,
                "transaction_type": t.transaction_type,
                "total_amount": float(t.total_amount),
                "payment_status": t.payment_status,
                "created_at": t.created_at.isoformat(),
                "customer_name": t.customer.name if t.customer else None,
            }
            for t in recent_raw
        ]

        expenses_by_category = await self.expense_repo.get_by_category(company_id, this_month_start, today)

        return DashboardMetrics(
            revenue=MetricCard(
                value=current_revenue,
                previous_value=prev_revenue,
                change_pct=pct_change(current_revenue, prev_revenue),
                label="Revenue",
            ),
            expenses=MetricCard(
                value=current_expenses,
                previous_value=prev_expenses,
                change_pct=pct_change(current_expenses, prev_expenses),
                label="Expenses",
            ),
            profit=MetricCard(
                value=current_profit,
                previous_value=prev_profit,
                change_pct=pct_change(current_profit, prev_profit),
                label="Net Profit",
            ),
            transactions_count=MetricCard(
                value=float(current_txn_count),
                previous_value=0,
                change_pct=0,
                label="Transactions",
            ),
            tank_levels=tank_levels,
            low_stock_count=low_stock_count,
            revenue_chart=revenue_chart,
            recent_transactions=recent_transactions,
            expenses_by_category=expenses_by_category,
        )

    async def invalidate_cache(self, company_id: UUID) -> None:
        from app.core.cache import cache_delete
        await cache_delete(f"dashboard:{company_id}")
