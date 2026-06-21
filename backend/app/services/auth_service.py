from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_delete, cache_get, cache_set
from app.core.config import settings
from app.core.exceptions import AuthenticationError, ConflictError, NotFoundError, ValidationError
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    create_verification_token,
    hash_password,
    verify_password,
)
from app.models.company import Company
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse

logger = structlog.get_logger(__name__)


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.user_repo = UserRepository(session)

    async def register(self, data: RegisterRequest) -> User:
        if await self.user_repo.email_exists(data.email):
            raise ConflictError("An account with this email already exists")

        slug = data.company_name.lower().replace(" ", "-").replace("'", "")
        company = Company(name=data.company_name, slug=f"{slug}-{int(datetime.now(UTC).timestamp())}")
        self.session.add(company)
        await self.session.flush()

        verification_token = create_verification_token()
        user = User(
            email=data.email.lower(),
            hashed_password=hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            company_id=company.id,
            verification_token=verification_token,
            is_verified=False,
        )
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)

        logger.info("user_registered", user_id=str(user.id), email=user.email)
        return user

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        token_payload = {"company_id": str(user.company_id), "role_id": str(user.role_id) if user.role_id else None}
        access_token = create_access_token(user.id, extra=token_payload)
        refresh_token = create_refresh_token(user.id)

        await cache_set(
            f"refresh_token:{user.id}",
            refresh_token,
            ttl=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )

        logger.info("user_logged_in", user_id=str(user.id))
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        from jose import JWTError
        from app.core.security import decode_token

        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                raise AuthenticationError("Invalid token type")
            user_id = UUID(payload["sub"])
        except (JWTError, ValueError, KeyError):
            raise AuthenticationError("Invalid refresh token")

        stored = await cache_get(f"refresh_token:{user_id}")
        if stored != refresh_token:
            raise AuthenticationError("Refresh token has been revoked")

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User not found or deactivated")

        token_payload = {"company_id": str(user.company_id), "role_id": str(user.role_id) if user.role_id else None}
        new_access = create_access_token(user.id, extra=token_payload)
        new_refresh = create_refresh_token(user.id)

        await cache_set(
            f"refresh_token:{user_id}",
            new_refresh,
            ttl=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        )

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def logout(self, user_id: UUID) -> None:
        await cache_delete(f"refresh_token:{user_id}")
        logger.info("user_logged_out", user_id=str(user_id))

    async def verify_email(self, token: str) -> User:
        user = await self.user_repo.get_by_verification_token(token)
        if not user:
            raise ValidationError("Invalid or expired verification token")
        user.is_verified = True
        user.verification_token = None
        self.session.add(user)
        await self.session.flush()
        return user

    async def forgot_password(self, email: str) -> str:
        user = await self.user_repo.get_by_email(email)
        if not user:
            return "ok"
        reset_token = create_password_reset_token()
        user.password_reset_token = reset_token
        self.session.add(user)
        await self.session.flush()
        return reset_token

    async def reset_password(self, token: str, new_password: str) -> None:
        user = await self.user_repo.get_by_reset_token(token)
        if not user:
            raise ValidationError("Invalid or expired reset token")
        user.hashed_password = hash_password(new_password)
        user.password_reset_token = None
        self.session.add(user)
        await self.session.flush()
        await cache_delete(f"refresh_token:{user.id}")
