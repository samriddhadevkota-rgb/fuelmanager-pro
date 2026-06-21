#!/usr/bin/env bash
set -euo pipefail

echo "Starting FuelManager Pro..."

if [ ! -f .env ]; then
  echo "Copying .env.example → .env"
  cp .env.example .env
fi

docker compose pull --quiet
docker compose up -d --build

echo "Waiting for database..."
until docker compose exec -T postgres pg_isready -U fuel_user -d fuel_db; do
  sleep 2
done

echo "Running migrations..."
docker compose exec -T backend alembic -c alembic.ini upgrade head

echo ""
echo "FuelManager Pro is running:"
echo "  App:        http://localhost"
echo "  API:        http://localhost/api/docs"
echo "  RabbitMQ:   http://localhost:15672  (fuel_user / fuel_pass)"
echo ""
