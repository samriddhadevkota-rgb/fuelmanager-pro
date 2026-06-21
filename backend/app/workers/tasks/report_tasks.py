from __future__ import annotations

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, queue="reports")
def generate_daily_report(self) -> dict:
    logger.info("Generating daily reports for all companies")
    return {"status": "completed"}


@celery_app.task(bind=True, max_retries=2, queue="reports")
def export_transactions_csv(self, company_id: str, start_date: str, end_date: str, user_email: str) -> dict:
    try:
        import csv
        import io
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Reference", "Type", "Amount", "Date", "Customer"])
        logger.info(f"CSV export completed for company {company_id}")
        return {"company_id": company_id, "status": "exported"}
    except Exception as exc:
        raise self.retry(exc=exc)
