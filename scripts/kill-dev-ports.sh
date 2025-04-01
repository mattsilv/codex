#!/bin/bash
# Script to kill processes running on development ports used by Codex

echo "Checking for processes on Codex development ports..."

# Ports used by Codex
# IMPORTANT: These ports MUST match what's configured in Google OAuth:
# - Port 3001: Required for frontend (configured in vite.config.js)
# - Port 5173: Alternative frontend port (Vite default)
# - Port 8787: Required for backend (Wrangler default)
FRONTEND_PORTS=(5173 3001)
BACKEND_PORT=8787

# Kill processes on frontend ports
for port in "${FRONTEND_PORTS[@]}"; do
  pid=$(lsof -i :$port -t 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Found process using frontend port $port (PID: $pid)"
    echo "Killing process..."
    kill -9 $pid
    echo "Process on port $port terminated"
  else
    echo "No process found on frontend port $port"
  fi
done

# Kill process on backend port
pid=$(lsof -i :$BACKEND_PORT -t 2>/dev/null)
if [ -n "$pid" ]; then
  echo "Found process using backend port $BACKEND_PORT (PID: $pid)"
  echo "Killing process..."
  kill -9 $pid
  echo "Process on port $BACKEND_PORT terminated"
else
  echo "No process found on backend port $BACKEND_PORT"
fi

echo "Port cleanup complete. You can now start the development servers."
echo "Remember to start both servers in separate terminals:"
echo "  - Backend: ./scripts/start-backend-simple.sh"
echo "  - Frontend: pnpm run dev:frontend"