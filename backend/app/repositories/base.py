from __future__ import annotations

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import BaseModel

ModelT = TypeVar("ModelT", bound=BaseModel)


class BaseRepository(Generic[ModelT]):
    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    async def get_by_id(self, id: UUID, company_id: UUID | None = None) -> ModelT | None:
        stmt = select(self.model).where(
            self.model.id == id,
            self.model.deleted_at.is_(None),
        )
        if company_id and hasattr(self.model, "company_id"):
            stmt = stmt.where(self.model.company_id == company_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        company_id: UUID,
        filters: dict[str, Any] | None = None,
        page: int = 1,
        per_page: int = 20,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        search_column: str | None = None,
        search_term: str | None = None,
    ) -> tuple[list[ModelT], int]:
        base_stmt = select(self.model).where(
            self.model.company_id == company_id,
            self.model.deleted_at.is_(None),
        )

        if filters:
            for key, value in filters.items():
                if value is not None and hasattr(self.model, key):
                    base_stmt = base_stmt.where(getattr(self.model, key) == value)

        if search_term and search_column and hasattr(self.model, search_column):
            col = getattr(self.model, search_column)
            base_stmt = base_stmt.where(col.ilike(f"%{search_term}%"))

        count_stmt = select(func.count()).select_from(base_stmt.subquery())
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        col = getattr(self.model, sort_by, self.model.created_at)
        if sort_order == "desc":
            base_stmt = base_stmt.order_by(col.desc())
        else:
            base_stmt = base_stmt.order_by(col.asc())

        offset = (page - 1) * per_page
        base_stmt = base_stmt.offset(offset).limit(per_page)

        result = await self.session.execute(base_stmt)
        return list(result.scalars().all()), total

    async def create(self, data: dict[str, Any]) -> ModelT:
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def update(self, instance: ModelT, data: dict[str, Any]) -> ModelT:
        for key, value in data.items():
            if hasattr(instance, key):
                setattr(instance, key, value)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def soft_delete(self, instance: ModelT) -> None:
        from datetime import UTC, datetime
        instance.deleted_at = datetime.now(UTC)
        instance.is_active = False
        self.session.add(instance)
        await self.session.flush()

    async def count(self, company_id: UUID, filters: dict[str, Any] | None = None) -> int:
        stmt = select(func.count(self.model.id)).where(
            self.model.company_id == company_id,
            self.model.deleted_at.is_(None),
        )
        if filters:
            for key, value in filters.items():
                if value is not None and hasattr(self.model, key):
                    stmt = stmt.where(getattr(self.model, key) == value)
        result = await self.session.execute(stmt)
        return result.scalar_one()
