from __future__ import annotations

from app.schemas.base import AppBaseModel


class MetricCard(AppBaseModel):
    value: float
    previous_value: float
    change_pct: float
    label: str


class TankLevelInfo(AppBaseModel):
    id: str
    name: str
    fuel_type: str
    capacity_liters: float
    current_level_liters: float
    level_percentage: float
    is_low: bool


class RevenueDataPoint(AppBaseModel):
    day: str
    revenue: float
    count: int


class DashboardMetrics(AppBaseModel):
    revenue: MetricCard
    expenses: MetricCard
    profit: MetricCard
    transactions_count: MetricCard
    tank_levels: list[TankLevelInfo]
    low_stock_count: int
    revenue_chart: list[RevenueDataPoint]
    recent_transactions: list[dict]
    expenses_by_category: list[dict]
