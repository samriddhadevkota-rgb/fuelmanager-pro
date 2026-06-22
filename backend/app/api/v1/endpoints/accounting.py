from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.services.company_service import CompanyService

router = APIRouter(prefix="/accounting", tags=["Accounting"])


@router.get("/pl")
async def profit_and_loss(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    year: int = Query(..., ge=2000, le=2100),
    month: int | None = Query(None, ge=1, le=12),
) -> dict:
    svc = CompanyService(db)
    return await svc.get_pl_summary(company_id, year, month)
