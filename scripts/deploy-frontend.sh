#!/bin/bash

echo "Building and deploying Codex Frontend with cache busting..."

# Save original wrangler.toml
if [ -f wrangler.toml ]; then
  echo "Backing up original wrangler.toml..."
  cp wrangler.toml wrangler.toml.bak
fi

# Create Pages-specific wrangler.toml
echo "Creating Pages-specific wrangler.toml..."
cat > wrangler.toml << EOL
name = "codex-frontend"
compatibility_date = "2025-03-30"

# Pages configuration
pages_build_output_dir = "dist"
EOL

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
npx wrangler pages deploy dist --project-name=codex --commit-dirty=true

# Restore original wrangler.toml
if [ -f wrangler.toml.bak ]; then
  echo "Restoring original wrangler.toml..."
  mv wrangler.toml.bak wrangler.toml
fi

echo "Deploy complete!"
echo "Your site should be live with fresh cache-busted assets."
echo "It may take a few minutes for the CDN to update."
echo ""
echo "If users still see old content, they can hard-refresh with Ctrl+F5 or clear browser cache."