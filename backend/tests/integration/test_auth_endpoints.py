from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_register_missing_fields(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "weak",
            "first_name": "Test",
            "last_name": "User",
            "company_name": "Test Co",
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "WrongPass1!"},
    )
    assert response.status_code in (401, 422)


@pytest.mark.asyncio
async def test_protected_endpoint_without_token(client: AsyncClient):
    response = await client.get("/api/v1/dashboard/metrics")
    assert response.status_code == 401
