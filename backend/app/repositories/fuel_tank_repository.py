from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.fuel_tank import FuelTank, TankRefill
from app.repositories.base import BaseRepository


class FuelTankRepository(BaseRepository[FuelTank]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, FuelTank)

    async def get_low_tanks(self, company_id: UUID) -> list[FuelTank]:
        stmt = select(FuelTank).where(
            FuelTank.company_id == company_id,
            FuelTank.deleted_at.is_(None),
            FuelTank.is_active == True,
        )
        result = await self.session.execute(stmt)
        tanks = result.scalars().all()
        return [t for t in tanks if t.is_low]


class TankRefillRepository(BaseRepository[TankRefill]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, TankRefill)

    async def get_by_tank(self, tank_id: UUID, page: int = 1, per_page: int = 20) -> tuple[list[TankRefill], int]:
        from sqlalchemy import func
        stmt = select(TankRefill).where(
            TankRefill.tank_id == tank_id,
            TankRefill.deleted_at.is_(None),
        ).order_by(TankRefill.created_at.desc())

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        stmt = stmt.offset((page - 1) * per_page).limit(per_page)
        result = await self.session.execute(stmt)
        return list(result.scalars().all()), total
