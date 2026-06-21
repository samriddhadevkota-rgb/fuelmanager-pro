from __future__ import annotations

import os
from uuid import UUID

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=30, queue="invoices")
def generate_invoice_pdf(self, invoice_id: str) -> dict:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

        from app.core.config import settings

        output_dir = os.path.join(settings.MEDIA_ROOT, "invoices")
        os.makedirs(output_dir, exist_ok=True)
        pdf_path = os.path.join(output_dir, f"invoice_{invoice_id}.pdf")

        doc = SimpleDocTemplate(pdf_path, pagesize=A4)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("INVOICE", styles["Title"]))
        elements.append(Spacer(1, 0.5 * cm))
        elements.append(Paragraph(f"Invoice ID: {invoice_id}", styles["Normal"]))
        elements.append(Spacer(1, 1 * cm))

        data = [
            ["Description", "Qty", "Unit Price", "Total"],
            ["Fuel Supply - Diesel", "100 L", "$1.50", "$150.00"],
        ]
        table = Table(data, colWidths=[8 * cm, 3 * cm, 3 * cm, 3 * cm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
        ]))
        elements.append(table)

        doc.build(elements)

        logger.info(f"Invoice PDF generated: {pdf_path}")
        return {"invoice_id": invoice_id, "pdf_path": pdf_path, "status": "success"}

    except Exception as exc:
        logger.error(f"Failed to generate invoice PDF {invoice_id}: {exc}")
        raise self.retry(exc=exc)
