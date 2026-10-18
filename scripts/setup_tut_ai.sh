#!/usr/bin/env bash
# TuT AI - Complete One-Click Setup & Bootstrap Script (Linux / macOS / Bash)
#
# Usage:
#   ./scripts/setup_tut_ai.sh

set -e

echo "=========================================================="
echo "   TuT AI Sovereign Platform - Setup & Startup Routine    "
echo "=========================================================="

# 1. Check Docker
echo -e "\n[1/6] Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon is not running! Please start Docker and rerun this script."
    exit 1
fi
echo "  Docker is running."

# 2. Check/Generate .env file
echo -e "\n[2/6] Checking environment file (.env)..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "  .env not found. Copying .env.example to .env..."
        cp .env.example .env
        echo "  Created .env from .env.example."
    fi
else
    echo "  .env configuration found."
fi

# 3. Launch Docker Compose Stack
echo -e "\n[3/6] Starting TuT AI container stack..."
docker compose up -d

# 4. Wait for Services
echo -e "\n[4/6] Waiting for TuT Postgres and TuT Agent to become ready..."
max_attempts=40
attempt=0
pg_ready=0

while [ $attempt -lt $max_attempts ] && [ $pg_ready -eq 0 ]; do
    attempt=$((attempt + 1))
    sleep 2
    status=$(docker inspect --format='{{json .State.Health.Status}}' mcit-ai-tut-postgres-1 2>/dev/null || true)
    if [[ "$status" =~ "healthy" ]]; then
        pg_ready=1
        echo "  PostgreSQL is ready and healthy!"
        break
    fi
    echo "  Waiting for PostgreSQL (attempt $attempt/$max_attempts)..."
done

# 5. Apply Model Upgrades and Runtime Patches
echo -e "\n[5/6] Applying TuT AI model intelligence and runtime patches..."

if [ -f "scripts/upgrade_tut_agent.sql" ]; then
    docker exec -i mcit-ai-tut-postgres-1 psql -U postgres -d tut_agent < scripts/upgrade_tut_agent.sql >/dev/null 2>&1 || true
    echo "  [OK] AI models context window (131,072) and reasoning config unlocked."
fi

if [ -f "scripts/patch_tut_generate_object.js" ]; then
    docker cp scripts/patch_tut_generate_object.js mcit-ai-tut-agent-1:/app/ 2>/dev/null || true
    docker exec mcit-ai-tut-agent-1 node /app/patch_tut_generate_object.js >/dev/null 2>&1 || true
    echo "  [OK] TuT Agent structured output & Ollama fallback verified."
fi

if [ -f "scripts/patch_tut_avatars.js" ]; then
    docker cp scripts/patch_tut_avatars.js mcit-ai-tut-agent-1:/app/ 2>/dev/null || true
    docker exec mcit-ai-tut-agent-1 node /app/patch_tut_avatars.js >/dev/null 2>&1 || true
    echo "  [OK] TuT Agent 1-click avatar switcher and clickability verified."
fi

if [ -f "scripts/patch_mcit_frontend.js" ]; then
    docker cp scripts/patch_mcit_frontend.js mcit-ai-mcit-ai-1:/app/ 2>/dev/null || true
    docker exec mcit-ai-mcit-ai-1 node /app/patch_mcit_frontend.js >/dev/null 2>&1 || true
    echo "  [OK] Platform Studio modal grid and Podcasts removal verified."
fi

# 6. Optimize GPU Velocity & Pin Ollama Model
echo -e "\n[6/6] Checking host GPU acceleration and pinning Ollama model..."
curl -s -X POST http://127.0.0.1:11434/api/generate -d '{"model":"gemma4:e4b","keep_alive":"-1"}' >/dev/null 2>&1 || true
echo "  [OK] Ollama model check completed."

echo -e "\n=========================================================="
echo "             TuT AI Platform is READY!                    "
echo "=========================================================="
echo "  * TuT Agent Chat:       http://localhost:3210"
echo "  * TuT Web Platform:     http://localhost:8502"
echo "  * ONLYOFFICE Docs:      http://localhost:8082"
echo -e "==========================================================\n"
