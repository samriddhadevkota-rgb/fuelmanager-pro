from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.vehicle import Vehicle
from app.repositories.base import BaseRepository
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

logger = structlog.get_logger(__name__)


class VehicleService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = BaseRepository(session, Vehicle)

    async def create(self, company_id: UUID, data: VehicleCreate) -> Vehicle:
        vehicle = await self.repo.create({"company_id": company_id, **data.model_dump()})
        logger.info("vehicle_created", vehicle_id=str(vehicle.id), plate=data.license_plate)
        return vehicle

    async def get(self, id: UUID, company_id: UUID) -> Vehicle:
        vehicle = await self.repo.get_by_id(id, company_id)
        if not vehicle:
            raise NotFoundError("Vehicle", str(id))
        return vehicle

    async def list(self, company_id: UUID, page: int = 1, per_page: int = 20, search: str | None = None) -> tuple[list[Vehicle], int]:
        return await self.repo.list(
            company_id=company_id,
            page=page,
            per_page=per_page,
            search_column="license_plate",
            search_term=search,
        )

    async def update(self, id: UUID, company_id: UUID, data: VehicleUpdate) -> Vehicle:
        vehicle = await self.repo.get_by_id(id, company_id)
        if not vehicle:
            raise NotFoundError("Vehicle", str(id))
        return await self.repo.update(vehicle, data.model_dump(exclude_none=True))

    async def delete(self, id: UUID, company_id: UUID) -> None:
        vehicle = await self.repo.get_by_id(id, company_id)
        if not vehicle:
            raise NotFoundError("Vehicle", str(id))
        await self.repo.soft_delete(vehicle)
