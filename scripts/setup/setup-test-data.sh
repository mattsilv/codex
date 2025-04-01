#!/bin/bash

# Wait for the backend server to start
echo "Waiting for backend server to start..."
for i in {1..10}; do
  if curl -s http://localhost:8787 > /dev/null; then
    break
  fi
  if [ $i -eq 10 ]; then
    echo "Backend server not responding. Please make sure it's running at http://localhost:8787"
    exit 1
  fi
  echo "Waiting... ($i/10)"
  sleep 2
done

# Seed test data
echo "Seeding test data..."
curl -X GET http://localhost:8787/api/seed-test-data

echo ""
echo "======================================"
echo "Backend is ready with test data!"
echo "Test users:"
echo "  - Email: alice@example.com"
echo "  - Password: password123"
echo ""
echo "  - Email: bob@example.com"
echo "  - Password: password123"
echo "======================================"