from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import text

from app.core.database import AsyncSessionLocal

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    db_ok = False
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass

    from app.core.cache import get_redis
    redis_ok = False
    try:
        redis = await get_redis()
        await redis.ping()
        redis_ok = True
    except Exception:
        pass

    from app.core.config import settings
    return {
        "status": "healthy" if (db_ok and redis_ok) else "degraded",
        "version": settings.APP_VERSION,
        "services": {
            "database": "up" if db_ok else "down",
            "redis": "up" if redis_ok else "down",
        },
    }
