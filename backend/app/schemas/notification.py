from __future__ import annotations

from datetime import datetime
from uuid import UUID

from app.schemas.base import AppBaseModel


class NotificationResponse(AppBaseModel):
    id: UUID
    title: str
    message: str
    notification_type: str
    is_read: bool
    read_at: datetime | None
    action_url: str | None
    created_at: datetime


class NotificationMarkRead(AppBaseModel):
    notification_ids: list[UUID]
