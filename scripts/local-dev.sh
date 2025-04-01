#!/bin/bash

# Check if users are trying to run with npm run dev
if [ "$1" == "frontend" ]; then
  echo "Starting frontend dev server at http://localhost:3000"
  npm run dev
  exit 0
fi

if [ "$1" == "backend" ]; then
  echo "Starting backend dev server at http://localhost:8787"
  npm run dev:backend
  exit 0
fi

# Start both frontend and backend in parallel
echo "Starting Codex development environment..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8787"

# Check if tmux is available to use a better terminal experience
if command -v tmux &> /dev/null; then
  # Use tmux for a better experience
  SESSION_NAME="codex-dev"
  
  # Kill existing session if it exists
  tmux kill-session -t "$SESSION_NAME" 2>/dev/null
  
  # Create a new session with backend
  tmux new-session -d -s "$SESSION_NAME" -n "Backend" "npm run dev:backend"
  
  # Create a window for frontend
  tmux new-window -t "$SESSION_NAME:1" -n "Frontend" "npm run dev"
  
  # Attach to the session
  tmux select-window -t "$SESSION_NAME:0"
  tmux attach-session -t "$SESSION_NAME"
else
  # Fallback to simple approach
  echo "For a better experience, install tmux."
  echo "Starting backend and frontend in parallel with simple approach..."
  
  # Start backend in background
  npm run dev:backend &
  BACKEND_PID=$!
  
  # Wait a bit for backend to start
  sleep 3
  
  # Seed test data
  echo "Seeding test data..."
  npm run seed-data:direct
  
  # Start frontend
  npm run dev
  
  # When frontend exits, kill the backend
  kill $BACKEND_PID
fi