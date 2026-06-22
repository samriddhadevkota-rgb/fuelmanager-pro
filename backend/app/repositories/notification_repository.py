from __future__ import annotations

from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_for_user(
        self,
        company_id: UUID,
        user_id: UUID,
        unread_only: bool = False,
        page: int = 1,
        per_page: int = 30,
    ) -> tuple[list[Notification], int]:
        from sqlalchemy import func

        base = select(Notification).where(
            Notification.company_id == company_id,
            (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
        )
        if unread_only:
            base = base.where(Notification.is_read.is_(False))

        count_result = await self.session.execute(
            select(func.count()).select_from(base.subquery())
        )
        total = count_result.scalar_one()

        rows = await self.session.execute(
            base.order_by(Notification.created_at.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(rows.scalars().all()), total

    async def mark_read(self, company_id: UUID, ids: list[UUID]) -> int:
        from datetime import datetime, timezone

        result = await self.session.execute(
            update(Notification)
            .where(Notification.id.in_(ids), Notification.company_id == company_id)
            .values(is_read=True, read_at=datetime.now(timezone.utc))
            .returning(Notification.id)
        )
        count = len(result.all())
        await self.session.commit()
        return count

    async def mark_all_read(self, company_id: UUID, user_id: UUID) -> None:
        from datetime import datetime, timezone

        await self.session.execute(
            update(Notification)
            .where(
                Notification.company_id == company_id,
                (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
                Notification.is_read.is_(False),
            )
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        await self.session.commit()

    async def unread_count(self, company_id: UUID, user_id: UUID) -> int:
        from sqlalchemy import func

        result = await self.session.execute(
            select(func.count()).where(
                Notification.company_id == company_id,
                (Notification.user_id == user_id) | (Notification.user_id.is_(None)),
                Notification.is_read.is_(False),
            )
        )
        return result.scalar_one()

    async def create(self, data: dict) -> Notification:
        n = Notification(**data)
        self.session.add(n)
        await self.session.commit()
        await self.session.refresh(n)
        return n
