#!/bin/bash

echo "Setting up Codex backend with enhanced settings..."

echo "Checking for database files..."
mkdir -p .wrangler/state/d1
mkdir -p .wrangler/state/r2
mkdir -p .wrangler/state/kv

# Check if we should use the local test backend
if [ "$1" == "--local-test" ]; then
  echo "Starting local test backend on port 8787..."
  node --experimental-modules src/backend/local-test.js
else
  # Start normal wrangler backend
  echo "Starting Cloudflare Workers backend on port 8787..."
  npx wrangler dev --port 8787 --local --persist
fi