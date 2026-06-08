#!/bin/bash

set -e  # Exit immediately if a command fails

echo "🛑 Stopping existing containers..."
docker compose -f deployment/dev/docker-compose.yml down

echo "🧹 Removing dangling images (optional cleanup)..."
docker image prune -f

echo "🔨 Building Docker image warehouse_mgmt_api:latest..."
docker build \
  -t warehouse_mgmt_api:latest \
  -f deployment/dev/Dockerfile \
  .

echo "🚀 Starting containers..."
docker compose -f deployment/dev/docker-compose.yml up -d

echo "✅ Dev environment is up and running!"
echo "🌍 Access: http://localhost:8000"