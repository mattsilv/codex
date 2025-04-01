#!/bin/bash

# Codex API Test Script
# Run comprehensive tests for the Codex backend API

# Colors for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Codex API Test Runner ===${NC}"
echo "This script will test all API endpoints in the Codex backend."

# Check if the backend server is already running
if ! curl -s "http://localhost:8787" > /dev/null; then
  echo -e "${YELLOW}⚠️ Backend server doesn't appear to be running!${NC}"
  echo "Please start the backend first with:"
  echo "  ./start-backend.sh"
  echo ""
  
  # Offer to start the backend server
  read -p "Would you like to start the backend now? (y/n): " REPLY
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Starting backend server...${NC}"
    
    # Start in background and store PID
    ./start-backend.sh &
    BACKEND_PID=$!
    
    # Wait for server to start
    echo "Waiting for server to start..."
    for i in {1..30}; do
      if curl -s "http://localhost:8787" > /dev/null; then
        echo -e "${GREEN}Server started successfully!${NC}"
        break
      fi
      
      if [[ $i -eq 30 ]]; then
        echo -e "${RED}Server failed to start within timeout period.${NC}"
        echo "Please start the server manually and try again."
        exit 1
      fi
      
      echo -n "."
      sleep 1
    done
  else
    echo -e "${RED}Aborting tests.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Backend server is already running at http://localhost:8787${NC}"
fi

# Run the debug-navigation.ts script
echo -e "\n${BLUE}Running API tests...${NC}"

# Check if ts-node is available through npx
if ! command -v npx &> /dev/null; then
  echo -e "${RED}Error: npx is not installed. Please install Node.js and npm.${NC}"
  exit 1
fi

# Run the tests
echo -e "${YELLOW}Starting test suite with debug-navigation.ts...${NC}"
echo -e "${YELLOW}--------------------------------------------${NC}"
npx ts-node debug-navigation.ts

# Store the exit code
TEST_RESULT=$?

# If we started the backend, kill it
if [ ! -z ${BACKEND_PID+x} ]; then
  echo -e "\n${BLUE}Cleaning up...${NC}"
  echo "Stopping backend server (PID: $BACKEND_PID)"
  kill $BACKEND_PID
  echo -e "${GREEN}Server stopped.${NC}"
fi

# Final status
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "\n${GREEN}Tests completed successfully!${NC}"
else
  echo -e "\n${RED}Tests failed with exit code ${TEST_RESULT}.${NC}"
fi

echo -e "${BLUE}=== Test Run Complete ===${NC}"
exit $TEST_RESULT