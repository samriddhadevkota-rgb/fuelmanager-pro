from __future__ import annotations

from fastapi import APIRouter

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.company import CompanyResponse, CompanySettingsUpdate
from app.services.company_service import CompanyService

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=CompanyResponse)
async def get_settings(company_id: CurrentCompanyDep, db: DatabaseDep) -> CompanyResponse:
    svc = CompanyService(db)
    return CompanyResponse.model_validate(await svc.get(company_id))


@router.patch("", response_model=CompanyResponse)
async def update_settings(
    data: CompanySettingsUpdate, company_id: CurrentCompanyDep, db: DatabaseDep
) -> CompanyResponse:
    svc = CompanyService(db)
    return CompanyResponse.model_validate(await svc.update(company_id, data))
