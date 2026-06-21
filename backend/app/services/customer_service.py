from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.customer import CustomerCreate, CustomerUpdate

logger = structlog.get_logger(__name__)


class CustomerService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = CustomerRepository(session)

    async def create(self, company_id: UUID, data: CustomerCreate) -> Customer:
        customer = await self.repo.create({"company_id": company_id, **data.model_dump()})
        logger.info("customer_created", customer_id=str(customer.id), name=data.name)
        return customer

    async def get(self, id: UUID, company_id: UUID) -> Customer:
        customer = await self.repo.get_by_id(id, company_id)
        if not customer:
            raise NotFoundError("Customer", str(id))
        return customer

    async def list(
        self,
        company_id: UUID,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        filters: dict | None = None,
    ) -> tuple[list[Customer], int]:
        return await self.repo.list(
            company_id=company_id,
            filters=filters,
            page=page,
            per_page=per_page,
            search_column="name",
            search_term=search,
        )

    async def update(self, id: UUID, company_id: UUID, data: CustomerUpdate) -> Customer:
        customer = await self.repo.get_by_id(id, company_id)
        if not customer:
            raise NotFoundError("Customer", str(id))
        return await self.repo.update(customer, data.model_dump(exclude_none=True))

    async def delete(self, id: UUID, company_id: UUID) -> None:
        customer = await self.repo.get_by_id(id, company_id)
        if not customer:
            raise NotFoundError("Customer", str(id))
        await self.repo.soft_delete(customer)
