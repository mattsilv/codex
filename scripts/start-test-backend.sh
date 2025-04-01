#!/bin/bash

# Start a simplified test backend for account testing
echo "Starting simplified test backend on port 8787..."
echo "This version uses in-memory storage for simplicity"

# Kill any existing node processes
pkill -f "node.*local-test.js" || true

# Run the local test server directly
node ./src/backend/local-test.js