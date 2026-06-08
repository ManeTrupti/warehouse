#!/bin/bash
set -e

if [ "$RUN_MAIN_SERVICE" = "true" ]; then

  echo "⏳ Waiting for Postgres..."
  while ! nc -z $DB_HOST $DB_PORT; do
    sleep 1
  done

  echo "✅ Postgres started"

  echo "📦 Running migrations..."
  python manage.py makemigrations --noinput
  python manage.py migrate_schemas --shared --noinput

  echo "🚀 Running initial setup..."
  python manage.py initial_setup || true

fi

echo "🔥 Starting service..."
exec "$@"