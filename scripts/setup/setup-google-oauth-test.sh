#!/bin/bash
# Setup and run Google OAuth test

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Google OAuth Test Setup ===${NC}"
echo "This script will run the Google OAuth test using environment variables."

# Check for .dev.vars file
if [ ! -f ./.dev.vars ]; then
  echo -e "${RED}Error: .dev.vars file not found${NC}"
  echo "Please create a .dev.vars file with GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN"
  exit 1
fi

# Export variables from .dev.vars
echo -e "${GREEN}Exporting environment variables from .dev.vars...${NC}"
export $(grep -v '^#' ./.dev.vars | xargs)

# Verify required variables are set
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$GOOGLE_REFRESH_TOKEN" ]; then
  echo -e "${RED}Error: Missing required Google OAuth variables in .dev.vars${NC}"
  echo "Make sure these variables are defined:"
  echo "  - GOOGLE_CLIENT_ID"
  echo "  - GOOGLE_CLIENT_SECRET"
  echo "  - GOOGLE_REFRESH_TOKEN"
  exit 1
fi

# Check if the backend is running
if ! curl -s http://localhost:8787/health > /dev/null; then
  echo -e "${YELLOW}Backend is not running. Starting simplified backend server...${NC}"
  
  # Start the simplified backend in the background
  ./scripts/start-simplified-backend.sh &
  
  # Store the process ID for later cleanup
  BACKEND_PID=$!
  
  # Wait for the backend to start
  echo "Waiting for backend to start..."
  attempts=0
  max_attempts=10
  
  while ! curl -s http://localhost:8787/health > /dev/null; do
    sleep 2
    attempts=$((attempts+1))
    if [ $attempts -ge $max_attempts ]; then
      echo -e "${RED}Error: Backend failed to start after $max_attempts attempts${NC}"
      # Kill the backend process if it was started
      if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
      fi
      exit 1
    fi
    echo "Waiting... ($attempts/$max_attempts)"
  done
  
  echo -e "${GREEN}Backend is now running!${NC}"
  started_backend=true
else
  echo -e "${GREEN}Backend is already running.${NC}"
  started_backend=false
fi

# Run the test
echo -e "${YELLOW}\nRunning Google OAuth test...${NC}"
node tests/e2e/test-google-oauth.js

# Store the exit code
test_exit_code=$?

# Cleanup: Kill the backend if we started it
if [ "$started_backend" = true ] && [ ! -z "$BACKEND_PID" ]; then
  echo -e "${YELLOW}Stopping backend server...${NC}"
  kill $BACKEND_PID
fi

# Final result
if [ $test_exit_code -eq 0 ]; then
  echo -e "${GREEN}\n✅ Test completed successfully!${NC}"
else
  echo -e "${RED}\n❌ Test failed with exit code $test_exit_code${NC}"
fi

exit $test_exit_code