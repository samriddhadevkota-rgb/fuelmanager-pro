from __future__ import annotations

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, queue="notifications")
def check_low_stock_alerts(self) -> dict:
    logger.info("Running scheduled low stock check")
    return {"status": "completed", "checked": True}


@celery_app.task(bind=True, queue="notifications")
def send_payment_reminder(self, invoice_id: str, customer_email: str, amount_due: float) -> dict:
    try:
        logger.info(f"Sending payment reminder for invoice {invoice_id}")
        from app.workers.tasks.email_tasks import send_invoice_email
        return {"invoice_id": invoice_id, "status": "reminded"}
    except Exception as exc:
        raise self.retry(exc=exc)
