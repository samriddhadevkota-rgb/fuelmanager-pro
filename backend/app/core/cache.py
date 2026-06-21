from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis_client


async def cache_get(key: str) -> Any | None:
    client = await get_redis()
    value = await client.get(key)
    if value is None:
        return None
    return json.loads(value)


async def cache_set(key: str, value: Any, ttl: int = settings.CACHE_TTL_SECONDS) -> None:
    client = await get_redis()
    await client.setex(key, ttl, json.dumps(value, default=str))


async def cache_delete(key: str) -> None:
    client = await get_redis()
    await client.delete(key)


async def cache_delete_pattern(pattern: str) -> None:
    client = await get_redis()
    keys = await client.keys(pattern)
    if keys:
        await client.delete(*keys)


async def cache_get_or_set(
    key: str,
    factory: Any,
    ttl: int = settings.CACHE_TTL_SECONDS,
) -> Any:
    cached = await cache_get(key)
    if cached is not None:
        return cached
    value = await factory()
    await cache_set(key, value, ttl)
    return value
