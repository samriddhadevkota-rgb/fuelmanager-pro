from __future__ import annotations

import asyncio

import asyncpg
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.core.database import get_db
from app.main import app
from app.models.base import Base

_TEST_DB_NAME = "fuel_test"


def _test_db_url() -> str:
    return settings.DATABASE_URL.replace("/fuel_db", f"/{_TEST_DB_NAME}")


def _asyncpg_dsn(url: str) -> str:
    """Convert SQLAlchemy async URL to plain asyncpg DSN."""
    return url.replace("postgresql+asyncpg://", "postgresql://")


async def _create_test_db_if_needed() -> None:
    """
    Create the test database when it doesn't exist.
    Must use a raw asyncpg connection because CREATE DATABASE cannot
    execute inside a transaction, which is how SQLAlchemy's engine
    always operates.
    """
    admin_dsn = _asyncpg_dsn(settings.DATABASE_URL)
    conn = await asyncpg.connect(admin_dsn)
    try:
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", _TEST_DB_NAME
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{_TEST_DB_NAME}"')
    finally:
        await conn.close()


# ── Ensure the DB exists once before any test in this session ─────────────────

def pytest_configure(config):  # noqa: ANN001
    asyncio.get_event_loop_policy()  # ensure policy is set


@pytest.fixture(scope="session", autouse=True)
def create_test_database():
    """Synchronous session fixture: create fuel_test DB before any test."""
    loop = asyncio.new_event_loop()
    try:
        loop.run_until_complete(_create_test_db_if_needed())
    finally:
        loop.close()
    yield


# ── Per-test fixtures ─────────────────────────────────────────────────────────

@pytest_asyncio.fixture()
async def db_session(create_test_database) -> AsyncSession:  # noqa: ANN001
    """
    Fresh NullPool engine per test so asyncpg connections are never
    shared across event loops.  Schema is created before and dropped
    after each test for full isolation.
    """
    engine = create_async_engine(_test_db_url(), echo=False, poolclass=NullPool)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with factory() as session:
        yield session
        await session.rollback()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture()
async def client(db_session: AsyncSession) -> AsyncClient:
    """
    HTTP test client with get_db overridden to use the isolated test
    session — requests never touch the production database.
    """
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.pop(get_db, None)
