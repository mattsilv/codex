#!/bin/bash

# Script to run comprehensive tests for the Codex application

echo "=== CODEX TEST RUNNER ==="
echo "This script will run both backend and frontend tests."

# Move to the root directory to ensure proper path resolution
cd "$(dirname "$0")/.." || exit

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "Error: Node.js is not installed or not in PATH."
  exit 1
fi

# Ensure dependencies are installed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies with pnpm..."
  pnpm install
fi

# First run the backend tests
echo -e "\n1. Running backend tests..."
node --experimental-modules src/backend/local-test.js

# Run unit tests
echo -e "\n2. Running unit tests..."
for test in tests/unit/*.js; do
  if [ -f "$test" ]; then
    echo "Running $test"
    node "$test"
  fi
done

# Run integration tests
echo -e "\n3. Running integration tests..."
for test in tests/integration/*.js; do
  if [ -f "$test" ]; then
    echo "Running $test"
    node "$test"
  fi
done

# Provide info on how to run the frontend tests
echo -e "\n4. Frontend tests can be run in two ways:"
echo "   A. In the browser:"
echo "      - Start the frontend server with: pnpm dev"
echo "      - Open http://localhost:3001 in your browser"
echo "      - Open the browser console and run: import { runAllTests } from './test-helpers.js'; runAllTests();"
echo ""
echo "   B. Using the test server:"
echo "      - Run: node tests/e2e/test-full.js"
echo "      - Open http://localhost:3000 in your browser and click 'Run Frontend Tests'"

# Ask user if they want to run the full test server
read -p "Would you like to start the test server now? (y/n): " choice
if [[ $choice =~ ^[Yy]$ ]]; then
  echo -e "\nStarting test server..."
  node tests/e2e/test-full.js
else
  echo -e "\nTest script complete. You can run the full test server later with:"
  echo "node tests/e2e/test-full.js"
fi