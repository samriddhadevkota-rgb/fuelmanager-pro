"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from __future__ import annotations

import uuid
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "companies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False, unique=True),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("address", sa.Text),
        sa.Column("city", sa.String(100)),
        sa.Column("state", sa.String(100)),
        sa.Column("country", sa.String(100), default="US"),
        sa.Column("postal_code", sa.String(20)),
        sa.Column("tax_id", sa.String(100)),
        sa.Column("currency", sa.String(3), default="USD"),
        sa.Column("timezone", sa.String(50), default="UTC"),
        sa.Column("logo_url", sa.String(500)),
        sa.Column("website", sa.String(255)),
        sa.Column("tax_rate", sa.Numeric(5, 2), default=0),
        sa.Column("fuel_price_markup", sa.Numeric(5, 2), default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_companies_slug", "companies", ["slug"])

    op.create_table(
        "roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500)),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
        sa.Column("resource", sa.String(100), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("description", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "role_permissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("permission_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_role_permissions_composite", "role_permissions", ["role_id", "permission_id"])

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("phone", sa.String(50)),
        sa.Column("avatar_url", sa.String(500)),
        sa.Column("is_verified", sa.Boolean, default=False),
        sa.Column("is_superuser", sa.Boolean, default=False),
        sa.Column("verification_token", sa.String(255)),
        sa.Column("password_reset_token", sa.String(255)),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("roles.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_company_id", "users", ["company_id"])

    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("address", sa.Text),
        sa.Column("city", sa.String(100)),
        sa.Column("state", sa.String(100)),
        sa.Column("country", sa.String(100), default="US"),
        sa.Column("tax_id", sa.String(100)),
        sa.Column("credit_limit", sa.Numeric(12, 2), default=0),
        sa.Column("credit_balance", sa.Numeric(12, 2), default=0),
        sa.Column("notes", sa.Text),
        sa.Column("customer_type", sa.String(50), default="individual"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_customers_company_id", "customers", ["company_id"])

    op.create_table(
        "vehicles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("license_plate", sa.String(50), nullable=False),
        sa.Column("make", sa.String(100)),
        sa.Column("model", sa.String(100)),
        sa.Column("year", sa.Integer),
        sa.Column("color", sa.String(50)),
        sa.Column("vin", sa.String(50), unique=True),
        sa.Column("fuel_type", sa.String(50), default="diesel"),
        sa.Column("tank_capacity_liters", sa.Numeric(8, 2), default=0),
        sa.Column("current_mileage_km", sa.Numeric(12, 2), default=0),
        sa.Column("status", sa.String(50), default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_vehicles_company_id", "vehicles", ["company_id"])
    op.create_index("ix_vehicles_license_plate", "vehicles", ["company_id", "license_plate"])

    op.create_table(
        "drivers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("vehicles.id", ondelete="SET NULL")),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("license_number", sa.String(100)),
        sa.Column("license_expiry", sa.String(20)),
        sa.Column("status", sa.String(50), default="active"),
        sa.Column("employee_id", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_drivers_company_id", "drivers", ["company_id"])

    op.create_table(
        "fuel_tanks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("fuel_type", sa.String(50), nullable=False),
        sa.Column("capacity_liters", sa.Numeric(12, 2), nullable=False),
        sa.Column("current_level_liters", sa.Numeric(12, 2), default=0),
        sa.Column("low_level_threshold_pct", sa.Numeric(5, 2), default=20),
        sa.Column("location", sa.String(255)),
        sa.Column("notes", sa.Text),
        sa.Column("last_refill_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "tank_refills",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tank_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("fuel_tanks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("liters_added", sa.Numeric(12, 2), nullable=False),
        sa.Column("cost_per_liter", sa.Numeric(10, 4), nullable=False),
        sa.Column("total_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("supplier", sa.String(255)),
        sa.Column("invoice_number", sa.String(100)),
        sa.Column("refilled_by", sa.String(255)),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id", ondelete="SET NULL")),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("vehicles.id", ondelete="SET NULL")),
        sa.Column("driver_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("drivers.id", ondelete="SET NULL")),
        sa.Column("fuel_tank_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("fuel_tanks.id", ondelete="SET NULL")),
        sa.Column("transaction_type", sa.String(50), nullable=False),
        sa.Column("reference_number", sa.String(100), nullable=False, unique=True),
        sa.Column("fuel_type", sa.String(50)),
        sa.Column("quantity_liters", sa.Numeric(12, 3), default=0),
        sa.Column("unit_price", sa.Numeric(10, 4), default=0),
        sa.Column("subtotal", sa.Numeric(12, 2), default=0),
        sa.Column("tax_amount", sa.Numeric(12, 2), default=0),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(50), default="cash"),
        sa.Column("payment_status", sa.String(50), default="paid"),
        sa.Column("mileage_km", sa.Numeric(12, 2)),
        sa.Column("notes", sa.Text),
        sa.Column("status", sa.String(50), default="completed"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )
    op.create_index("ix_transactions_company_date", "transactions", ["company_id", "created_at"])
    op.create_index("ix_transactions_type", "transactions", ["company_id", "transaction_type"])

    op.create_table(
        "invoices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("invoice_number", sa.String(100), nullable=False, unique=True),
        sa.Column("status", sa.String(50), default="draft"),
        sa.Column("issue_date", sa.Date, nullable=False),
        sa.Column("due_date", sa.Date, nullable=False),
        sa.Column("subtotal", sa.Numeric(12, 2), default=0),
        sa.Column("tax_rate", sa.Numeric(5, 2), default=0),
        sa.Column("tax_amount", sa.Numeric(12, 2), default=0),
        sa.Column("discount_amount", sa.Numeric(12, 2), default=0),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("amount_paid", sa.Numeric(12, 2), default=0),
        sa.Column("notes", sa.Text),
        sa.Column("terms", sa.Text),
        sa.Column("pdf_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "invoice_line_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("invoice_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("quantity", sa.Numeric(12, 3), nullable=False),
        sa.Column("unit", sa.String(50), default="liters"),
        sa.Column("unit_price", sa.Numeric(10, 4), nullable=False),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "expenses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("description", sa.String(500), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("expense_date", sa.Date, nullable=False),
        sa.Column("vendor", sa.String(255)),
        sa.Column("receipt_url", sa.String(500)),
        sa.Column("reference_number", sa.String(100)),
        sa.Column("payment_method", sa.String(50), default="cash"),
        sa.Column("is_recurring", sa.Boolean, default=False),
        sa.Column("notes", sa.Text),
        sa.Column("status", sa.String(50), default="approved"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "payments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("invoice_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("invoices.id", ondelete="SET NULL")),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id", ondelete="SET NULL")),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_date", sa.Date, nullable=False),
        sa.Column("payment_method", sa.String(50), nullable=False),
        sa.Column("reference_number", sa.String(100)),
        sa.Column("status", sa.String(50), default="completed"),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.Column("is_active", sa.Boolean, default=True),
    )

    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE")),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("notification_type", sa.String(50), default="info"),
        sa.Column("is_read", sa.Boolean, default=False),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.Column("action_url", sa.String(500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_id", postgresql.UUID(as_uuid=True)),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(100)),
        sa.Column("changes", sa.JSON),
        sa.Column("ip_address", sa.String(50)),
        sa.Column("user_agent", sa.String(500)),
        sa.Column("correlation_id", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_company", "audit_logs", ["company_id", "created_at"])
    op.create_index("ix_audit_logs_resource", "audit_logs", ["resource", "resource_id"])


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("notifications")
    op.drop_table("payments")
    op.drop_table("expenses")
    op.drop_table("invoice_line_items")
    op.drop_table("invoices")
    op.drop_table("transactions")
    op.drop_table("tank_refills")
    op.drop_table("fuel_tanks")
    op.drop_table("drivers")
    op.drop_table("vehicles")
    op.drop_table("customers")
    op.drop_table("users")
    op.drop_table("role_permissions")
    op.drop_table("permissions")
    op.drop_table("roles")
    op.drop_table("companies")
