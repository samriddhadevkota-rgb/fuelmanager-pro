# FuelManager Pro

Enterprise Fuel Management & Accounting SaaS Platform.

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.x, Alembic |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, RabbitMQ 3.12, Celery |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion |
| Proxy | Nginx |
| CI/CD | GitHub Actions |

## Quick Start

```bash
cp .env.example .env
./scripts/start.sh
```

Services:
- App: http://localhost
- API Docs: http://localhost/api/docs
- RabbitMQ UI: http://localhost:15672 (fuel_user / fuel_pass)

## Development

```bash
# Backend only
cd backend
python -m uvicorn app.main:app --reload

# Frontend only
cd frontend
npm install && npm run dev

# Run tests
cd backend
pytest tests/ -v --cov=app
```

## Migrations

```bash
# Apply migrations
./scripts/migrate.sh

# Create new migration
docker compose exec backend alembic revision --autogenerate -m "description"
```

## Architecture

```
backend/
  app/
    core/          # Config, DB, security, cache, middleware
    models/        # SQLAlchemy ORM models (UUID PKs, soft deletes)
    schemas/       # Pydantic v2 request/response schemas
    repositories/  # Data access layer (generic BaseRepository)
    services/      # Business logic layer
    api/v1/        # FastAPI route handlers
    workers/       # Celery tasks (invoices, email, reports)

frontend/
  app/             # Next.js 15 App Router pages
  components/      # Reusable UI components
  services/        # API client layer
  store/           # Zustand state management
  types/           # TypeScript type definitions
  lib/             # Utilities, formatters, constants, animations
```

## Modules

- **Dashboard** — KPI cards, revenue chart (30 days), tank levels, alerts
- **Fuel Inventory** — Tank management, refill history, low-stock alerts
- **Transactions** — Fuel sales/purchases with filtering and search
- **Customers** — Profiles, credit balances, pagination
- **Vehicles** — Fleet registry with mileage tracking
- **Invoices** — PDF generation, email delivery, status tracking
- **Expenses** — Category tracking with P&L integration
- **Reports** — CSV/PDF exports via Celery background jobs
- **Auth** — JWT + refresh token rotation, Argon2, RBAC, multi-tenant
