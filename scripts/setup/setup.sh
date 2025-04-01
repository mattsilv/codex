#!/bin/bash

# Codex Monorepo Setup Script

echo "📦 Setting up Codex monorepo..."

# Install dependencies
echo "📚 Installing dependencies..."
npm install

# Create Cloudflare D1 database
echo "🗄️ Creating Cloudflare D1 database..."
npx wrangler d1 create codex_db

# Save the database ID
echo "⚙️ Please enter your D1 database ID shown above:"
read DB_ID

# Update wrangler.toml with database ID
sed -i'' -e "s/placeholder-database-id/$DB_ID/g" wrangler.toml
echo "✅ Updated wrangler.toml with database ID"

# Create R2 bucket
echo "📦 Creating Cloudflare R2 bucket..."
npx wrangler r2 bucket create codex-content

# Apply migrations
echo "🧩 Applying database migrations..."
npx wrangler d1 migrations apply codex_db

echo "🚀 Setup complete! You can now start development with:"
echo "   npm run dev            # Frontend development"
echo "   npm run dev:worker     # Backend development"
echo ""
echo "🔍 To view your database in the Cloudflare dashboard:"
echo "   https://dash.cloudflare.com/workers/d1"
echo ""