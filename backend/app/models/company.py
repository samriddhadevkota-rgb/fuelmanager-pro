from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.driver import Driver
    from app.models.expense import Expense
    from app.models.fuel_tank import FuelTank
    from app.models.invoice import Invoice
    from app.models.transaction import Transaction
    from app.models.user import User
    from app.models.vehicle import Vehicle


class Company(BaseModel):
    __tablename__ = "companies"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100), default="US")
    postal_code: Mapped[str | None] = mapped_column(String(20))
    tax_id: Mapped[str | None] = mapped_column(String(100))
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    logo_url: Mapped[str | None] = mapped_column(String(500))
    website: Mapped[str | None] = mapped_column(String(255))
    tax_rate: Mapped[float] = mapped_column(default=0.0)
    fuel_price_markup: Mapped[float] = mapped_column(default=0.0)

    users: Mapped[list[User]] = relationship("User", back_populates="company")
    customers: Mapped[list[Customer]] = relationship("Customer", back_populates="company")
    vehicles: Mapped[list[Vehicle]] = relationship("Vehicle", back_populates="company")
    drivers: Mapped[list[Driver]] = relationship("Driver", back_populates="company")
    fuel_tanks: Mapped[list[FuelTank]] = relationship("FuelTank", back_populates="company")
    transactions: Mapped[list[Transaction]] = relationship("Transaction", back_populates="company")
    invoices: Mapped[list[Invoice]] = relationship("Invoice", back_populates="company")
    expenses: Mapped[list[Expense]] = relationship("Expense", back_populates="company")
