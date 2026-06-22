from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.core.dependencies import CurrentCompanyDep, DatabaseDep
from app.schemas.base import MessageResponse, PaginatedResponse
from app.schemas.base import AppBaseModel
from app.services.expense_service import ExpenseCreate, ExpenseService, ExpenseUpdate

router = APIRouter(prefix="/expenses", tags=["Expenses"])


class ExpenseResponse(AppBaseModel):
    id: str
    category: str
    description: str
    amount: float
    expense_date: str
    vendor: str | None
    payment_method: str
    reference_number: str | None
    notes: str | None
    is_recurring: bool
    status: str
    is_active: bool
    created_at: str
    updated_at: str


@router.get("", response_model=PaginatedResponse[dict])
async def list_expenses(
    company_id: CurrentCompanyDep,
    db: DatabaseDep,
    page: int = Query(1, ge=1),
    per_page: int = Query(20),
    category: str | None = Query(None),
) -> PaginatedResponse[dict]:
    svc = ExpenseService(db)
    filters = {"category": category} if category else None
    items, total = await svc.list(company_id, page=page, per_page=per_page, filters=filters)
    data = [
        {
            "id": str(e.id),
            "category": e.category,
            "description": e.description,
            "amount": float(e.amount),
            "expense_date": str(e.expense_date),
            "vendor": e.vendor,
            "payment_method": e.payment_method,
            "reference_number": e.reference_number,
            "notes": e.notes,
            "is_recurring": e.is_recurring,
            "status": e.status,
            "is_active": e.is_active,
            "created_at": e.created_at.isoformat(),
            "updated_at": e.updated_at.isoformat(),
        }
        for e in items
    ]
    return PaginatedResponse.create(data=data, total=total, page=page, per_page=per_page)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_expense(data: ExpenseCreate, company_id: CurrentCompanyDep, db: DatabaseDep) -> dict:
    svc = ExpenseService(db)
    expense = await svc.create(company_id, data)
    return {"id": str(expense.id), "message": "Expense created", "amount": float(expense.amount)}


@router.get("/{expense_id}")
async def get_expense(expense_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> dict:
    svc = ExpenseService(db)
    expense = await svc.get(expense_id, company_id)
    return {
        "id": str(expense.id),
        "category": expense.category,
        "description": expense.description,
        "amount": float(expense.amount),
        "expense_date": str(expense.expense_date),
        "vendor": expense.vendor,
        "payment_method": expense.payment_method,
        "is_recurring": expense.is_recurring,
        "status": expense.status,
        "notes": expense.notes,
        "created_at": expense.created_at.isoformat(),
    }


@router.patch("/{expense_id}")
async def update_expense(expense_id: UUID, data: ExpenseUpdate, company_id: CurrentCompanyDep, db: DatabaseDep) -> dict:
    svc = ExpenseService(db)
    expense = await svc.update(expense_id, company_id, data)
    return {"id": str(expense.id), "amount": float(expense.amount), "updated": True}


@router.delete("/{expense_id}", response_model=MessageResponse)
async def delete_expense(expense_id: UUID, company_id: CurrentCompanyDep, db: DatabaseDep) -> MessageResponse:
    svc = ExpenseService(db)
    await svc.delete(expense_id, company_id)
    return MessageResponse(message="Expense deleted successfully")
