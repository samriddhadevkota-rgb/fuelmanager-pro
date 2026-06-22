from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import AppBaseModel, MessageResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


class DailyReportRequest(AppBaseModel):
    start_date: str | None = None
    end_date: str | None = None


@router.post("/transactions/export", response_model=MessageResponse)
async def export_transactions(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    fmt: str = Query("csv", pattern="^(csv|pdf)$"),
) -> MessageResponse:
    from app.workers.tasks.report_tasks import export_transactions_csv

    export_transactions_csv.delay(str(company_id), fmt)
    return MessageResponse(message=f"Transaction export ({fmt.upper()}) queued — you will receive an email when ready.")


@router.post("/daily", response_model=MessageResponse)
async def trigger_daily_report(
    body: DailyReportRequest,
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
) -> MessageResponse:
    from app.workers.tasks.report_tasks import generate_daily_report

    generate_daily_report.delay(str(company_id), body.start_date, body.end_date)
    return MessageResponse(message="Daily report generation queued.")
