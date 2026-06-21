from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import hash_password, verify_password, create_access_token
from uuid import uuid4


def test_password_hash_and_verify():
    password = "TestPassword1!"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("WrongPassword1!", hashed)


def test_create_access_token():
    user_id = uuid4()
    token = create_access_token(user_id, extra={"company_id": str(uuid4())})
    assert isinstance(token, str)
    assert len(token) > 10

    from app.core.security import decode_token
    payload = decode_token(token)
    assert payload["sub"] == str(user_id)
    assert payload["type"] == "access"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    from app.services.auth_service import AuthService
    from app.schemas.auth import RegisterRequest

    mock_session = AsyncMock()
    svc = AuthService(mock_session)

    with patch.object(svc.user_repo, "email_exists", return_value=True):
        data = RegisterRequest(
            email="test@example.com",
            password="TestPass1!",
            first_name="John",
            last_name="Doe",
            company_name="Test Co",
        )
        with pytest.raises(ConflictError, match="email already exists"):
            await svc.register(data)


@pytest.mark.asyncio
async def test_login_invalid_password():
    from app.services.auth_service import AuthService
    from app.schemas.auth import LoginRequest
    from app.models.user import User
    from uuid import uuid4

    mock_session = AsyncMock()
    svc = AuthService(mock_session)

    mock_user = MagicMock(spec=User)
    mock_user.hashed_password = hash_password("CorrectPassword1!")
    mock_user.is_active = True

    with patch.object(svc.user_repo, "get_by_email", return_value=mock_user):
        data = LoginRequest(email="test@example.com", password="WrongPass1!")
        with pytest.raises(AuthenticationError):
            await svc.login(data)
