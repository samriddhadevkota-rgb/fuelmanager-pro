from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.driver import Driver
from app.repositories.base import BaseRepository
from app.schemas.driver import DriverCreate, DriverUpdate

logger = structlog.get_logger(__name__)


class DriverService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = BaseRepository(session, Driver)

    async def create(self, company_id: UUID, data: DriverCreate) -> Driver:
        payload = data.model_dump(exclude_none=True)
        payload["company_id"] = company_id
        driver = await self.repo.create(payload)
        logger.info("driver_created", driver_id=str(driver.id), name=driver.full_name)
        return driver

    async def get(self, id: UUID, company_id: UUID) -> Driver:
        driver = await self.repo.get_by_id(id, company_id)
        if not driver:
            raise NotFoundError("Driver", str(id))
        return driver

    async def list(
        self,
        company_id: UUID,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        status: str | None = None,
    ) -> tuple[list[Driver], int]:
        filters = {}
        if status:
            filters["status"] = status
        return await self.repo.list(
            company_id=company_id,
            filters=filters or None,
            page=page,
            per_page=per_page,
            search_columns=["first_name", "last_name"],
            search_term=search,
        )

    async def update(self, id: UUID, company_id: UUID, data: DriverUpdate) -> Driver:
        driver = await self.repo.get_by_id(id, company_id)
        if not driver:
            raise NotFoundError("Driver", str(id))
        return await self.repo.update(driver, data.model_dump(exclude_none=True))

    async def delete(self, id: UUID, company_id: UUID) -> None:
        driver = await self.repo.get_by_id(id, company_id)
        if not driver:
            raise NotFoundError("Driver", str(id))
        await self.repo.soft_delete(driver)
