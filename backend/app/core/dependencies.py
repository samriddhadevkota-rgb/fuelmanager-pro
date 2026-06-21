from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationError
from app.core.security import decode_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> UUID:
    if not credentials:
        raise AuthenticationError("Missing authentication token")
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise AuthenticationError("Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationError("Invalid token payload")
        return UUID(user_id)
    except (JWTError, ValueError):
        raise AuthenticationError("Invalid or expired token")


async def get_current_company_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> UUID:
    if not credentials:
        raise AuthenticationError("Missing authentication token")
    try:
        payload = decode_token(credentials.credentials)
        company_id = payload.get("company_id")
        if not company_id:
            raise AuthenticationError("No company associated with token")
        return UUID(company_id)
    except (JWTError, ValueError):
        raise AuthenticationError("Invalid or expired token")


DatabaseDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[UUID, Depends(get_current_user_id)]
CurrentCompanyDep = Annotated[UUID, Depends(get_current_company_id)]
