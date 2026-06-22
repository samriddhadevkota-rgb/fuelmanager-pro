from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.driver import DriverCreate, DriverResponse, DriverUpdate
from app.services.driver_service import DriverService

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.get("", response_model=PaginatedResponse[DriverResponse])
async def list_drivers(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status: str | None = Query(None),
) -> PaginatedResponse[DriverResponse]:
    svc = DriverService(db)
    items, total = await svc.list(company_id, page=page, per_page=per_page, search=search, status=status)
    return PaginatedResponse.create(
        data=[DriverResponse.model_validate(d) for d in items],
        total=total, page=page, per_page=per_page,
    )


@router.post("", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
async def create_driver(data: DriverCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> DriverResponse:
    svc = DriverService(db)
    return DriverResponse.model_validate(await svc.create(company_id, data))


@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver(driver_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> DriverResponse:
    svc = DriverService(db)
    return DriverResponse.model_validate(await svc.get(driver_id, company_id))


@router.patch("/{driver_id}", response_model=DriverResponse)
async def update_driver(driver_id: UUID, data: DriverUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> DriverResponse:
    svc = DriverService(db)
    return DriverResponse.model_validate(await svc.update(driver_id, company_id, data))


@router.delete("/{driver_id}", response_model=MessageResponse)
async def delete_driver(driver_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = DriverService(db)
    await svc.delete(driver_id, company_id)
    return MessageResponse(message="Driver deleted successfully")
