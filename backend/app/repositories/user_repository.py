from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower(), User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_verification_token(self, token: str) -> User | None:
        stmt = select(User).where(User.verification_token == token, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_reset_token(self, token: str) -> User | None:
        stmt = select(User).where(User.password_reset_token == token, User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        stmt = select(User.id).where(User.email == email.lower(), User.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None
