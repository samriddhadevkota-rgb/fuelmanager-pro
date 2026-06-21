from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, CurrentUserDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.transaction import TransactionCreate, TransactionResponse, TransactionUpdate
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=PaginatedResponse[TransactionResponse])
async def list_transactions(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    transaction_type: str | None = Query(None),
    payment_status: str | None = Query(None),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
) -> PaginatedResponse[TransactionResponse]:
    svc = TransactionService(db)
    filters: dict = {}
    if transaction_type:
        filters["transaction_type"] = transaction_type
    if payment_status:
        filters["payment_status"] = payment_status
    items, total = await svc.list(company_id, page=page, per_page=per_page, filters=filters or None, search=search)
    return PaginatedResponse.create(
        data=[TransactionResponse.model_validate(i) for i in items],
        total=total, page=page, per_page=per_page,
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    data: TransactionCreate,
    company_id: CurrentCompanyDep,
    user_id: CurrentUserDep,
    db: DatabaseDep,
) -> TransactionResponse:
    svc = TransactionService(db)
    txn = await svc.create(company_id, user_id, data)
    return TransactionResponse.model_validate(txn)


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(transaction_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> TransactionResponse:
    svc = TransactionService(db)
    txn = await svc.get(transaction_id, company_id)
    return TransactionResponse.model_validate(txn)


@router.patch("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(transaction_id: UUID, data: TransactionUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> TransactionResponse:
    svc = TransactionService(db)
    txn = await svc.update(transaction_id, company_id, data)
    return TransactionResponse.model_validate(txn)


@router.delete("/{transaction_id}", response_model=MessageResponse)
async def delete_transaction(transaction_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = TransactionService(db)
    await svc.delete(transaction_id, company_id)
    return MessageResponse(message="Transaction deleted successfully")
