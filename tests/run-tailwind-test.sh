#!/bin/bash

# Script to test Tailwind CSS configuration

echo "=== TAILWIND CSS TEST RUNNER ==="
echo "This script will test the Tailwind CSS configuration."

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

# Run the Tailwind CSS test
echo -e "\nRunning Tailwind CSS test..."
node tests/unit/test-tailwind.js

# Run CLI test if available
if [ -f "tests/unit/test-tailwind-cli.js" ]; then
  echo -e "\nRunning Tailwind CLI test..."
  node tests/unit/test-tailwind-cli.js
fi

echo -e "\nTest complete. If any issues were found, please fix them and run the test again."