#!/bin/bash

echo "Building and deploying Codex with cache busting..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Build frontend
echo "Building frontend with cache busting..."
pnpm build

# Add Cloudflare headers file for cache control
echo "Adding cache control headers..."
cat > dist/_headers << EOL
/*
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
EOL

# Deploy to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=codex --commit-dirty=true --config=wrangler.pages.toml

echo "Deploy complete!"
echo "Your site should be live with fresh cache-busted assets."
echo "It may take a few minutes for the CDN to update."
echo ""
echo "If users still see old content, they can hard-refresh with Ctrl+F5 or clear browser cache."