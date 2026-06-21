from __future__ import annotations

import time
import uuid

import structlog
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = structlog.get_logger(__name__)


class CorrelationIdMiddleware:
    """Pure ASGI middleware — avoids BaseHTTPMiddleware's anyio task-group
    which breaks asyncpg's greenlet bridge under SQLAlchemy 2.x."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        raw_headers: dict[bytes, bytes] = {k: v for k, v in scope.get("headers", [])}
        correlation_id = (
            raw_headers.get(b"x-correlation-id", b"").decode() or str(uuid.uuid4())
        )

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            correlation_id=correlation_id,
            path=scope.get("path", ""),
            method=scope.get("method", ""),
        )

        async def send_with_cid(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.append("X-Correlation-ID", correlation_id)
            await send(message)

        await self.app(scope, receive, send_with_cid)


class RequestLoggingMiddleware:
    """Pure ASGI middleware for request duration logging."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        status_code = 500

        async def send_with_timing(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                duration_ms = round((time.perf_counter() - start) * 1000, 2)
                headers = MutableHeaders(scope=message)
                headers.append("X-Response-Time", f"{duration_ms}ms")
                logger.info(
                    "http_request",
                    status_code=status_code,
                    duration_ms=duration_ms,
                    method=scope.get("method", ""),
                    path=scope.get("path", ""),
                )
            await send(message)

        await self.app(scope, receive, send_with_timing)
