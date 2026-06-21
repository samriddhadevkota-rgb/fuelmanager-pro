from __future__ import annotations

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, queue="audit", acks_late=True)
def log_audit_event(
    self,
    company_id: str,
    user_id: str | None,
    action: str,
    resource: str,
    resource_id: str | None,
    changes: dict | None,
    ip_address: str | None,
    correlation_id: str | None,
) -> dict:
    logger.info(
        "audit_event",
        company_id=company_id,
        user_id=user_id,
        action=action,
        resource=resource,
        resource_id=resource_id,
    )
    return {"logged": True, "action": action, "resource": resource}
