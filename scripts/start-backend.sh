#!/bin/bash

# Check if wrangler is installed
if ! command -v npx &> /dev/null
then
    echo "Error: npx is not installed. Please install Node.js and npm."
    exit 1
fi

# Create directories if they don't exist
mkdir -p .wrangler/state/d1
mkdir -p .wrangler/state/r2
mkdir -p .wrangler/state/kv

# Create the D1 database if it doesn't exist yet
echo "Ensuring database exists..."
if [ ! -f .wrangler/state/d1/codex_db.sqlite3 ]; then
    npx wrangler d1 create codex_db --local
fi

# Apply migrations
echo "Applying database migrations..."
npx wrangler d1 migrations apply codex_db --local

# Start the dev server with proper bindings
echo "Starting Codex backend server..."
echo "API will be available at http://localhost:8787"

# Use unbuffer if available to ensure we see output in real-time
if command -v unbuffer &> /dev/null; then
    unbuffer npx wrangler dev --port 8787 --local --persist 
else
    # Otherwise use stdbuf to ensure unbuffered output
    stdbuf -o0 npx wrangler dev --port 8787 --local --persist 
fi