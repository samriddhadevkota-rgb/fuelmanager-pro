from __future__ import annotations

from uuid import UUID

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.models.transaction import Transaction
from app.repositories.fuel_tank_repository import FuelTankRepository
from app.repositories.transaction_repository import TransactionRepository
from app.schemas.transaction import TransactionCreate, TransactionUpdate

logger = structlog.get_logger(__name__)


class TransactionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = TransactionRepository(session)
        self.tank_repo = FuelTankRepository(session)

    async def create(self, company_id: UUID, user_id: UUID, data: TransactionCreate) -> Transaction:
        if data.fuel_tank_id:
            tank = await self.tank_repo.get_by_id(data.fuel_tank_id, company_id)
            if not tank:
                raise NotFoundError("FuelTank", str(data.fuel_tank_id))
            if data.transaction_type == "sale":
                if tank.current_level_liters < data.quantity_liters:
                    raise BusinessRuleError(
                        f"Insufficient fuel: tank has {tank.current_level_liters}L, requested {data.quantity_liters}L"
                    )
                tank.current_level_liters = float(tank.current_level_liters) - data.quantity_liters
                self.session.add(tank)

        subtotal = round(data.quantity_liters * data.unit_price, 2)
        from app.repositories.base import BaseRepository
        from app.models.company import Company
        from sqlalchemy import select
        company_stmt = select(Company).where(Company.id == company_id)
        company_result = await self.session.execute(company_stmt)
        company = company_result.scalar_one_or_none()
        tax_rate = float(company.tax_rate) if company else 0.0
        tax_amount = round(subtotal * tax_rate / 100, 2)
        total_amount = subtotal + tax_amount

        reference_number = await self.repo.next_reference_number(company_id)

        transaction = await self.repo.create({
            "company_id": company_id,
            "customer_id": data.customer_id,
            "vehicle_id": data.vehicle_id,
            "driver_id": data.driver_id,
            "fuel_tank_id": data.fuel_tank_id,
            "transaction_type": data.transaction_type,
            "reference_number": reference_number,
            "fuel_type": data.fuel_type,
            "quantity_liters": data.quantity_liters,
            "unit_price": data.unit_price,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "total_amount": total_amount,
            "payment_method": data.payment_method,
            "mileage_km": data.mileage_km,
            "notes": data.notes,
        })

        from app.services.dashboard_service import DashboardService
        await DashboardService(self.session).invalidate_cache(company_id)

        logger.info(
            "transaction_created",
            transaction_id=str(transaction.id),
            reference=reference_number,
            total=total_amount,
            company_id=str(company_id),
        )
        return transaction

    async def get(self, id: UUID, company_id: UUID) -> Transaction:
        txn = await self.repo.get_with_relations(id, company_id)
        if not txn:
            raise NotFoundError("Transaction", str(id))
        return txn

    async def list(
        self,
        company_id: UUID,
        page: int = 1,
        per_page: int = 20,
        filters: dict | None = None,
        search: str | None = None,
    ) -> tuple[list[Transaction], int]:
        return await self.repo.list(
            company_id=company_id,
            filters=filters,
            page=page,
            per_page=per_page,
            search_column="reference_number",
            search_term=search,
        )

    async def update(self, id: UUID, company_id: UUID, data: TransactionUpdate) -> Transaction:
        txn = await self.repo.get_by_id(id, company_id)
        if not txn:
            raise NotFoundError("Transaction", str(id))
        update_data = data.model_dump(exclude_none=True)
        return await self.repo.update(txn, update_data)

    async def delete(self, id: UUID, company_id: UUID) -> None:
        txn = await self.repo.get_by_id(id, company_id)
        if not txn:
            raise NotFoundError("Transaction", str(id))
        await self.repo.soft_delete(txn)
        await DashboardService(self.session).invalidate_cache(company_id)
