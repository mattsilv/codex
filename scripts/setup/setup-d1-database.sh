#!/bin/bash

# Setup script for initializing D1 databases for Codex
# This script will migrate both development and production D1 databases

echo "======================================"
echo "Codex D1 Database Setup"
echo "======================================"

echo "This script will set up both development and production D1 databases."
echo "You should have already created the databases using wrangler CLI."
echo ""

# Check if Wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed. Please install it with 'npm install -g wrangler'"
    exit 1
fi

echo "1️⃣ Setting up development database (codex-dev-db)..."
echo "--------------------------------------"

# Run local migrations
echo "Running migrations for development database..."
npx wrangler d1 execute codex-dev-db --file=./migrations/0000_initial_schema.sql
npx wrangler d1 execute codex-dev-db --file=./migrations/0001_add_user_deletion.sql
npx wrangler d1 execute codex-dev-db --file=./migrations/0002_add_email_verification.sql

# Verify development database
echo "Verifying development database..."
npx wrangler d1 execute codex-dev-db --command="SELECT name FROM sqlite_master WHERE type='table';"

echo ""
echo "2️⃣ Setting up production database (codex-prod-db)..."
echo "--------------------------------------"

# Prompt for confirmation before touching production
read -p "Do you want to migrate the production database? (y/n) " -n 1 -r
echo 
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Run production migrations
    echo "Running migrations for production database..."
    npx wrangler d1 execute codex-prod-db --file=./migrations/0000_initial_schema.sql
    npx wrangler d1 execute codex-prod-db --file=./migrations/0001_add_user_deletion.sql
    npx wrangler d1 execute codex-prod-db --file=./migrations/0002_add_email_verification.sql

    # Verify production database
    echo "Verifying production database..."
    npx wrangler d1 execute codex-prod-db --command="SELECT name FROM sqlite_master WHERE type='table';"
else
    echo "Skipping production database setup."
fi

echo ""
echo "✅ D1 database setup completed."
echo "You can now start your development server with 'pnpm dev:all'"
echo "Your application will use the D1 database for both development and production."