from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentCompanyDep, CurrentUserDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.notification import NotificationMarkRead, NotificationResponse
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=PaginatedResponse[NotificationResponse])
async def list_notifications(
    company_id: CurrentCompanyDep,
    user_id: CurrentUserDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(30, ge=1, le=100),
    unread_only: bool = Query(False),
) -> PaginatedResponse[NotificationResponse]:
    svc = NotificationService(db)
    items, total = await svc.list(company_id, user_id, unread_only=unread_only, page=page, per_page=per_page)
    return PaginatedResponse.create(
        data=[NotificationResponse.model_validate(n) for n in items],
        total=total, page=page, per_page=per_page,
    )


@router.get("/unread-count")
async def unread_count(company_id: CurrentCompanyDep, user_id: CurrentUserDep, db: DatabaseDep) -> dict:
    svc = NotificationService(db)
    count = await svc.unread_count(company_id, user_id)
    return {"unread_count": count}


@router.post("/mark-read", response_model=MessageResponse)
async def mark_read(data: NotificationMarkRead, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = NotificationService(db)
    n = await svc.mark_read(company_id, data.notification_ids)
    return MessageResponse(message=f"{n} notification(s) marked as read")


@router.post("/mark-all-read", response_model=MessageResponse)
async def mark_all_read(company_id: CurrentCompanyDep, user_id: CurrentUserDep, db: DatabaseDep) -> MessageResponse:
    svc = NotificationService(db)
    await svc.mark_all_read(company_id, user_id)
    return MessageResponse(message="All notifications marked as read")
