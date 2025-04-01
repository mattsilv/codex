#!/bin/bash

echo "Setting up Codex local development environment"
echo "=============================================="

# Step 1: Kill any existing processes
echo "Step 1: Stopping any existing processes..."
pkill -f "wrangler dev" || true
pkill -f "node --experimental-modules src/backend/local-test.js" || true
pkill -f "vite dev" || true

# Step 2: Start the backend
echo "Step 2: Starting the local test backend..."
./start-backend-simple.sh --local-test > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"
echo "Backend logs are in backend.log"

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Step 3: Test backend connectivity
echo "Step 3: Testing backend connectivity..."
curl -s http://localhost:8787/api > /dev/null
if [ $? -eq 0 ]; then
  echo "Backend is running and accessible"
else
  echo "Warning: Backend may not be running correctly. Check backend.log"
fi

# Step 4: Start the frontend
echo "Step 4: Starting the frontend..."
pnpm dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"
echo "Frontend logs are in frontend.log"

# Wait for frontend to start
echo "Waiting for frontend to start..."
sleep 5

# Step 5: Open debugging tools
echo "Step 5: Opening debugging tools..."
echo "Opening debug auth page in browser..."
./open-debug-auth.sh

echo ""
echo "Local development environment is running!"
echo "=========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8787/api"
echo "Debug Auth: http://localhost:3000/debug-auth.html"
echo ""
echo "Process information:"
echo "Backend PID: $BACKEND_PID (logs in backend.log)"
echo "Frontend PID: $FRONTEND_PID (logs in frontend.log)"
echo ""
echo "To stop all processes, run: pkill -f 'node' || true"
echo ""