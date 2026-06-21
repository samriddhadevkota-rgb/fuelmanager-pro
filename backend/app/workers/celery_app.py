from __future__ import annotations

from celery import Celery
from celery.utils.log import get_task_logger

from app.core.config import settings

celery_app = Celery(
    "fuelmanager",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.workers.tasks.invoice_tasks",
        "app.workers.tasks.email_tasks",
        "app.workers.tasks.report_tasks",
        "app.workers.tasks.notification_tasks",
        "app.workers.tasks.audit_tasks",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_max_retries=3,
    task_default_retry_delay=60,
    broker_connection_retry_on_startup=True,
    task_routes={
        "app.workers.tasks.invoice_tasks.*": {"queue": "invoices"},
        "app.workers.tasks.email_tasks.*": {"queue": "emails"},
        "app.workers.tasks.report_tasks.*": {"queue": "reports"},
        "app.workers.tasks.notification_tasks.*": {"queue": "notifications"},
        "app.workers.tasks.audit_tasks.*": {"queue": "audit"},
    },
    beat_schedule={
        "check-low-stock-alerts": {
            "task": "app.workers.tasks.notification_tasks.check_low_stock_alerts",
            "schedule": 3600.0,
        },
        "generate-daily-report": {
            "task": "app.workers.tasks.report_tasks.generate_daily_report",
            "schedule": 86400.0,
        },
    },
)
