from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Customer)

    async def search(self, company_id: UUID, term: str, page: int = 1, per_page: int = 20) -> tuple[list[Customer], int]:
        return await self.list(
            company_id=company_id,
            page=page,
            per_page=per_page,
            search_column="name",
            search_term=term,
        )
