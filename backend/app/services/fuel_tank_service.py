from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.fuel_tank import FuelTank, TankRefill
from app.repositories.fuel_tank_repository import FuelTankRepository, TankRefillRepository
from app.schemas.fuel_tank import FuelTankCreate, FuelTankUpdate, TankRefillCreate

logger = structlog.get_logger(__name__)


class FuelTankService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.tank_repo = FuelTankRepository(session)
        self.refill_repo = TankRefillRepository(session)

    async def create_tank(self, company_id: UUID, data: FuelTankCreate) -> FuelTank:
        if data.current_level_liters > data.capacity_liters:
            raise BusinessRuleError("Current level cannot exceed capacity")
        tank = await self.tank_repo.create({
            "company_id": company_id,
            **data.model_dump(),
        })
        logger.info("fuel_tank_created", tank_id=str(tank.id), name=data.name, company_id=str(company_id))
        return tank

    async def get_tank(self, id: UUID, company_id: UUID) -> FuelTank:
        tank = await self.tank_repo.get_by_id(id, company_id)
        if not tank:
            raise NotFoundError("FuelTank", str(id))
        return tank

    async def list_tanks(self, company_id: UUID, page: int = 1, per_page: int = 50) -> tuple[list[FuelTank], int]:
        return await self.tank_repo.list(company_id=company_id, page=page, per_page=per_page)

    async def update_tank(self, id: UUID, company_id: UUID, data: FuelTankUpdate) -> FuelTank:
        tank = await self.tank_repo.get_by_id(id, company_id)
        if not tank:
            raise NotFoundError("FuelTank", str(id))
        update_data = data.model_dump(exclude_none=True)
        if "current_level_liters" in update_data:
            capacity = update_data.get("capacity_liters", float(tank.capacity_liters))
            if update_data["current_level_liters"] > capacity:
                raise BusinessRuleError("Current level cannot exceed capacity")
        return await self.tank_repo.update(tank, update_data)

    async def delete_tank(self, id: UUID, company_id: UUID) -> None:
        tank = await self.tank_repo.get_by_id(id, company_id)
        if not tank:
            raise NotFoundError("FuelTank", str(id))
        await self.tank_repo.soft_delete(tank)

    async def add_refill(self, tank_id: UUID, company_id: UUID, data: TankRefillCreate) -> TankRefill:
        tank = await self.tank_repo.get_by_id(tank_id, company_id)
        if not tank:
            raise NotFoundError("FuelTank", str(tank_id))

        new_level = float(tank.current_level_liters) + data.liters_added
        if new_level > float(tank.capacity_liters):
            raise BusinessRuleError(
                f"Refill would exceed capacity: {new_level}L > {tank.capacity_liters}L"
            )

        refill = await self.refill_repo.create({
            "tank_id": tank_id,
            **data.model_dump(),
        })

        await self.tank_repo.update(tank, {
            "current_level_liters": new_level,
            "last_refill_at": datetime.now(UTC),
        })

        from app.services.dashboard_service import DashboardService
        await DashboardService(self.session).invalidate_cache(company_id)

        logger.info("tank_refilled", tank_id=str(tank_id), liters=data.liters_added)
        return refill

    async def get_low_tanks(self, company_id: UUID) -> list[FuelTank]:
        return await self.tank_repo.get_low_tanks(company_id)
