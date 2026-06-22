from __future__ import annotations

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, queue="reports")
def generate_daily_report(
    self,
    company_id: str,
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict:
    logger.info("Generating daily report", company_id=company_id, start=start_date, end=end_date)
    return {"company_id": company_id, "status": "completed"}


@celery_app.task(bind=True, max_retries=2, queue="reports")
def export_transactions_csv(self, company_id: str, fmt: str = "csv") -> dict:
    try:
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Reference", "Type", "Amount", "Date", "Customer"])
        logger.info("Export completed", company_id=company_id, fmt=fmt)
        return {"company_id": company_id, "fmt": fmt, "status": "exported"}
    except Exception as exc:
        raise self.retry(exc=exc)
