#!/bin/bash

# Start both backend and frontend servers in background
echo "Starting Codex development environment..."

# Test Tailwind CSS configuration before starting services
./run-tailwind-test.sh

if [ $? -ne 0 ]; then
  echo "ERROR: Tailwind CSS configuration test failed. Please fix the issues before continuing."
  exit 1
fi

# Kill any existing servers
kill_servers() {
  echo "Stopping servers..."
  pkill -f "wrangler dev" 2>/dev/null
  pkill -f "vite" 2>/dev/null
}

# Clean exit handling
trap kill_servers EXIT INT TERM

# Start backend
echo "Starting backend server (wrangler)..."
npm run dev:worker &
WRANGLER_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 5

# Start frontend
echo "Starting frontend server (vite)..."
npm run dev &
VITE_PID=$!

echo ""
echo "Codex development environment is running:"
echo "- Backend: http://localhost:8787"
echo "- Frontend: http://localhost:3000"
echo "- API Test Page: http://localhost:3000/test.html"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes to exit
wait $WRANGLER_PID $VITE_PID