from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.fuel_tank import FuelTankCreate, FuelTankResponse, FuelTankUpdate, TankRefillCreate, TankRefillResponse
from app.services.fuel_tank_service import FuelTankService

router = APIRouter(prefix="/fuel-tanks", tags=["Fuel Tanks"])


@router.get("", response_model=PaginatedResponse[FuelTankResponse])
async def list_tanks(company_id: CurrentCompanyDep, db: DatabaseDep, page: int = Query(1, ge=1), per_page: int = Query(50)) -> PaginatedResponse[FuelTankResponse]:
    svc = FuelTankService(db)
    items, total = await svc.list_tanks(company_id, page=page, per_page=per_page)
    return PaginatedResponse.create(
        data=[FuelTankResponse.model_validate(i) for i in items],
        total=total, page=page, per_page=per_page,
    )


@router.post("", response_model=FuelTankResponse, status_code=status.HTTP_201_CREATED)
async def create_tank(data: FuelTankCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> FuelTankResponse:
    svc = FuelTankService(db)
    tank = await svc.create_tank(company_id, data)
    return FuelTankResponse.model_validate(tank)


@router.get("/low-stock", response_model=list[FuelTankResponse])
async def get_low_stock_tanks(company_id: CurrentCompanyDep, db: DatabaseDep) -> list[FuelTankResponse]:
    svc = FuelTankService(db)
    tanks = await svc.get_low_tanks(company_id)
    return [FuelTankResponse.model_validate(t) for t in tanks]


@router.get("/{tank_id}", response_model=FuelTankResponse)
async def get_tank(tank_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> FuelTankResponse:
    svc = FuelTankService(db)
    tank = await svc.get_tank(tank_id, company_id)
    return FuelTankResponse.model_validate(tank)


@router.patch("/{tank_id}", response_model=FuelTankResponse)
async def update_tank(tank_id: UUID, data: FuelTankUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> FuelTankResponse:
    svc = FuelTankService(db)
    tank = await svc.update_tank(tank_id, company_id, data)
    return FuelTankResponse.model_validate(tank)


@router.delete("/{tank_id}", response_model=MessageResponse)
async def delete_tank(tank_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = FuelTankService(db)
    await svc.delete_tank(tank_id, company_id)
    return MessageResponse(message="Tank deleted successfully")


@router.post("/{tank_id}/refills", response_model=TankRefillResponse, status_code=status.HTTP_201_CREATED)
async def add_refill(tank_id: UUID, data: TankRefillCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> TankRefillResponse:
    svc = FuelTankService(db)
    refill = await svc.add_refill(tank_id, company_id, data)
    return TankRefillResponse.model_validate(refill)
