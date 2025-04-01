#!/bin/bash
# Script to run the E2E registration test

# Create screenshots directory if it doesn't exist
mkdir -p tests/screenshots

# Check if development server is running
if ! curl -s http://localhost:3001 > /dev/null; then
  echo "Starting development server..."
  # Start the development server in the background
  pnpm run dev &
  DEV_SERVER_PID=$!
  # Wait for the server to start
  echo "Waiting for development server to start..."
  sleep 10
fi

# Check if backend server is running
if ! curl -s http://localhost:8787 > /dev/null; then
  echo "Starting backend server..."
  # Start the backend server in the background
  ./start-backend.sh &
  BACKEND_SERVER_PID=$!
  # Wait for the server to start
  echo "Waiting for backend server to start..."
  sleep 10
fi

# Run the test
echo "Running registration and login test..."
node tests/e2e/test-registration-login.js

# Capture the exit code
TEST_EXIT_CODE=$?

# Kill the dev server if we started it
if [ ! -z "$DEV_SERVER_PID" ]; then
  echo "Stopping development server..."
  kill $DEV_SERVER_PID
fi

# Kill the backend server if we started it
if [ ! -z "$BACKEND_SERVER_PID" ]; then
  echo "Stopping backend server..."
  kill $BACKEND_SERVER_PID
fi

# Exit with the test's exit code
echo "Test completed with exit code: $TEST_EXIT_CODE"
exit $TEST_EXIT_CODE