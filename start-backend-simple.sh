#!/bin/bash

# Create directories
mkdir -p .wrangler/state/d1
mkdir -p .wrangler/state/r2 

# Create database if needed and apply migrations
npx wrangler d1 create codex_db --local || true
npx wrangler d1 migrations apply codex_db --local

# Start the backend server with necessary options
echo "Starting Codex backend server at http://localhost:8787"
npx wrangler dev --port 8787 --local --persist