from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.vehicle import VehicleCreate, VehicleResponse, VehicleUpdate
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=PaginatedResponse[VehicleResponse])
async def list_vehicles(company_id: CurrentCompanyDep, db: DatabaseDep, page: int = Query(1, ge=1), per_page: int = Query(20), search: str | None = None) -> PaginatedResponse[VehicleResponse]:
    svc = VehicleService(db)
    items, total = await svc.list(company_id, page=page, per_page=per_page, search=search)
    return PaginatedResponse.create(data=[VehicleResponse.model_validate(i) for i in items], total=total, page=page, per_page=per_page)


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(data: VehicleCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> VehicleResponse:
    svc = VehicleService(db)
    return VehicleResponse.model_validate(await svc.create(company_id, data))


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> VehicleResponse:
    svc = VehicleService(db)
    return VehicleResponse.model_validate(await svc.get(vehicle_id, company_id))


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(vehicle_id: UUID, data: VehicleUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> VehicleResponse:
    svc = VehicleService(db)
    return VehicleResponse.model_validate(await svc.update(vehicle_id, company_id, data))


@router.delete("/{vehicle_id}", response_model=MessageResponse)
async def delete_vehicle(vehicle_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = VehicleService(db)
    await svc.delete(vehicle_id, company_id)
    return MessageResponse(message="Vehicle deleted successfully")
