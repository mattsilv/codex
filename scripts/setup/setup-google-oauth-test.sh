#!/bin/bash

# Script to set up and execute the Google OAuth test
set -e

# Display header
echo "====================================="
echo "Google OAuth Test Setup and Execution"
echo "====================================="
echo

# Check if .dev.vars exists
if [ ! -f "./.dev.vars" ]; then
  echo "Error: .dev.vars file not found."
  echo "Please create this file in the project root with your Google OAuth credentials."
  exit 1
fi

# Check if required variables are in .dev.vars
if ! grep -q "GOOGLE_CLIENT_ID" ./.dev.vars || \
   ! grep -q "GOOGLE_CLIENT_SECRET" ./.dev.vars || \
   ! grep -q "GOOGLE_REFRESH_TOKEN" ./.dev.vars; then
  echo "Error: Missing one or more required variables in .dev.vars"
  echo "Please ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set."
  echo 
  echo "To obtain these credentials:"
  echo "1. Go to the Google Cloud Console: https://console.cloud.google.com/"
  echo "2. Create a project and enable the Google OAuth API"
  echo "3. Create OAuth 2.0 credentials"
  echo "4. Set up authorized redirect URIs (e.g., http://localhost:8787/api/auth/callback/google)"
  echo "5. Get a refresh token using the Google OAuth Playground (https://developers.google.com/oauthplayground/)"
  exit 1
fi

# Export variables from .dev.vars for the test script
echo "Loading environment variables from .dev.vars..."
export $(grep -v '^#' ./.dev.vars | xargs)

# Check if backend is running
echo "Checking if backend server is running..."
if ! curl -s http://localhost:8787/api/health >/dev/null; then
  echo "Backend server does not appear to be running."
  echo "Starting backend server..."
  
  # Start the backend server in the background
  ./scripts/start-backend.sh &
  BACKEND_PID=$!
  
  # Wait for backend to start
  echo "Waiting for backend to start..."
  for i in {1..10}; do
    if curl -s http://localhost:8787/api/health >/dev/null; then
      echo "Backend server started successfully!"
      break
    fi
    if [ $i -eq 10 ]; then
      echo "Error: Failed to start backend server."
      exit 1
    fi
    sleep 2
  done
  
  # Set flag to kill backend when script ends
  KILL_BACKEND=true
else
  echo "Backend server is already running."
  KILL_BACKEND=false
fi

# Run the OAuth test
echo
echo "Running Google OAuth login test..."
node ./tests/e2e/test-google-oauth.js

# Capture the exit code
TEST_EXIT_CODE=$?

# Clean up
if [ "$KILL_BACKEND" = true ]; then
  echo "Stopping backend server..."
  kill $BACKEND_PID
fi

# Exit with the test's exit code
exit $TEST_EXIT_CODE