from __future__ import annotations

import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from celery.utils.log import get_task_logger

from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


def _send_smtp(to_email: str, subject: str, html_body: str) -> None:
    from app.core.config import settings
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, queue="emails")
def send_invoice_email(self, invoice_id: str) -> dict:
    try:
        logger.info(f"Sending invoice email for {invoice_id}")
        return {"invoice_id": invoice_id, "status": "sent"}
    except Exception as exc:
        logger.error(f"Failed to send invoice email: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, queue="emails")
def send_welcome_email(self, user_id: str, email: str, name: str, verification_token: str) -> dict:
    try:
        from app.core.config import settings
        html = f"""
        <html><body>
        <h2>Welcome to {settings.APP_NAME}, {name}!</h2>
        <p>Click the link below to verify your email:</p>
        <a href="{settings.FRONTEND_URL}/verify-email?token={verification_token}"
           style="background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
           Verify Email
        </a>
        </body></html>
        """
        _send_smtp(email, f"Welcome to {settings.APP_NAME} - Verify Your Email", html)
        return {"user_id": user_id, "status": "sent"}
    except Exception as exc:
        logger.error(f"Failed to send welcome email: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60, queue="emails")
def send_low_stock_alert_email(self, company_id: str, tank_name: str, level_pct: float, recipient_email: str) -> dict:
    try:
        html = f"""
        <html><body>
        <h2>Low Fuel Alert</h2>
        <p>Tank <strong>{tank_name}</strong> is at <strong>{level_pct:.1f}%</strong> capacity.</p>
        <p>Please arrange a refill soon to avoid disruptions.</p>
        </body></html>
        """
        _send_smtp(recipient_email, f"Low Fuel Alert: {tank_name}", html)
        return {"company_id": company_id, "status": "sent"}
    except Exception as exc:
        raise self.retry(exc=exc)
