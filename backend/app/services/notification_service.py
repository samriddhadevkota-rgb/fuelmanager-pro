from __future__ import annotations

from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = NotificationRepository(session)

    async def list(
        self,
        company_id: UUID,
        user_id: UUID,
        unread_only: bool = False,
        page: int = 1,
        per_page: int = 30,
    ) -> tuple[list[Notification], int]:
        return await self.repo.list_for_user(company_id, user_id, unread_only, page, per_page)

    async def unread_count(self, company_id: UUID, user_id: UUID) -> int:
        return await self.repo.unread_count(company_id, user_id)

    async def mark_read(self, company_id: UUID, ids: list[UUID]) -> int:
        return await self.repo.mark_read(company_id, ids)

    async def mark_all_read(self, company_id: UUID, user_id: UUID) -> None:
        await self.repo.mark_all_read(company_id, user_id)
