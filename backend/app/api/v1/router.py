from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    accounting,
    auth,
    customers,
    dashboard,
    drivers,
    expenses,
    fuel_tanks,
    health,
    invoices,
    notifications,
    reports,
    settings,
    transactions,
    vehicles,
)

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(customers.router)
api_router.include_router(vehicles.router)
api_router.include_router(drivers.router)
api_router.include_router(fuel_tanks.router)
api_router.include_router(transactions.router)
api_router.include_router(invoices.router)
api_router.include_router(expenses.router)
api_router.include_router(notifications.router)
api_router.include_router(settings.router)
api_router.include_router(accounting.router)
api_router.include_router(reports.router)
