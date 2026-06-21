from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=PaginatedResponse[CustomerResponse])
async def list_customers(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    customer_type: str | None = Query(None),
) -> PaginatedResponse[CustomerResponse]:
    svc = CustomerService(db)
    filters = {"customer_type": customer_type} if customer_type else None
    items, total = await svc.list(company_id, page=page, per_page=per_page, search=search, filters=filters)
    return PaginatedResponse.create(
        data=[CustomerResponse.model_validate(i) for i in items],
        total=total, page=page, per_page=per_page,
    )


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(data: CustomerCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> CustomerResponse:
    svc = CustomerService(db)
    customer = await svc.create(company_id, data)
    return CustomerResponse.model_validate(customer)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> CustomerResponse:
    svc = CustomerService(db)
    customer = await svc.get(customer_id, company_id)
    return CustomerResponse.model_validate(customer)


@router.patch("/{customer_id}", response_model=CustomerResponse)
async def update_customer(customer_id: UUID, data: CustomerUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> CustomerResponse:
    svc = CustomerService(db)
    customer = await svc.update(customer_id, company_id, data)
    return CustomerResponse.model_validate(customer)


@router.delete("/{customer_id}", response_model=MessageResponse)
async def delete_customer(customer_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = CustomerService(db)
    await svc.delete(customer_id, company_id)
    return MessageResponse(message="Customer deleted successfully")
