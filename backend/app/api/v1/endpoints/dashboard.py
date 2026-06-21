from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.dashboard import DashboardMetrics
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(company_id: CurrentCompanyDep, db: DatabaseDep) -> DashboardMetrics:
    svc = DashboardService(db)
    return await svc.get_metrics(company_id)
