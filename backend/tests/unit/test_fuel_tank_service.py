from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.core.exceptions import BusinessRuleError, NotFoundError


@pytest.mark.asyncio
async def test_add_refill_exceeds_capacity():
    from app.services.fuel_tank_service import FuelTankService
    from app.schemas.fuel_tank import TankRefillCreate
    from app.models.fuel_tank import FuelTank

    mock_session = AsyncMock()
    svc = FuelTankService(mock_session)

    mock_tank = MagicMock(spec=FuelTank)
    mock_tank.current_level_liters = 800.0
    mock_tank.capacity_liters = 1000.0

    tank_id = uuid4()
    company_id = uuid4()

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(svc.tank_repo, "get_by_id", AsyncMock(return_value=mock_tank))
        refill = TankRefillCreate(liters_added=300.0, cost_per_liter=1.5, total_cost=450.0)
        with pytest.raises(BusinessRuleError, match="exceed capacity"):
            await svc.add_refill(tank_id, company_id, refill)


@pytest.mark.asyncio
async def test_get_tank_not_found():
    from app.services.fuel_tank_service import FuelTankService

    mock_session = AsyncMock()
    svc = FuelTankService(mock_session)

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr(svc.tank_repo, "get_by_id", AsyncMock(return_value=None))
        with pytest.raises(NotFoundError):
            await svc.get_tank(uuid4(), uuid4())


@pytest.mark.asyncio
async def test_create_tank_level_exceeds_capacity():
    from app.services.fuel_tank_service import FuelTankService
    from app.schemas.fuel_tank import FuelTankCreate

    mock_session = AsyncMock()
    svc = FuelTankService(mock_session)

    data = FuelTankCreate(
        name="Tank A",
        fuel_type="diesel",
        capacity_liters=1000.0,
        current_level_liters=1200.0,
    )
    with pytest.raises(BusinessRuleError, match="cannot exceed capacity"):
        await svc.create_tank(uuid4(), data)
