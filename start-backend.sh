#!/bin/bash

# Script to start the Codex backend server
# Ensures all dependencies and environment settings are correct

echo "Starting Codex backend server..."

# Check for required commands
if ! command -v npx &> /dev/null; then
  echo "Error: npx is not installed. Please install Node.js and npm."
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "Error: node is not installed. Please install Node.js."
  exit 1
fi

# Create required directories
echo "Setting up Wrangler state directories..."
mkdir -p .wrangler/state/d1
mkdir -p .wrangler/state/r2
mkdir -p .wrangler/state/kv

# Check for existing Wrangler configuration
if [ ! -f "wrangler.toml" ]; then
  echo "Error: wrangler.toml is missing. Please ensure the project is set up correctly."
  exit 1
fi

# Apply migrations if database doesn't exist
if [ ! -f .wrangler/state/d1/codex_db.sqlite3 ]; then
  echo "Database not found, creating and applying migrations..."
  npx wrangler d1 create codex_db || echo "Database may already exist, continuing..."
  npx wrangler d1 migrations apply codex_db --local
else
  echo "Using existing database, checking for pending migrations..."
  npx wrangler d1 migrations apply codex_db --local
fi

# Start the Wrangler dev server
echo "Starting Cloudflare Workers backend server on port 8787..."
echo "API will be available at http://localhost:8787"
npx wrangler dev --port 8787 --persist-to .wrangler/state

# Exit with the result of the Wrangler command
exit $?