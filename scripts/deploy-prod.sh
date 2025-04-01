#!/bin/bash

# Deploy Codex to production
echo "Deploying Codex to production..."

# Build the frontend
echo "Building frontend..."
pnpm build

# Deploy the backend to production
echo "Deploying backend to api.codex.silv.app..."
npx wrangler deploy --env production

# Deploy the frontend to Cloudflare Pages
# You'll need to set up Cloudflare Pages in the Cloudflare dashboard first
# and connect it to your repository
echo "To deploy the frontend to codex.silv.app, use the Cloudflare Pages dashboard"
echo "or run the following command once configured:"
echo "npx wrangler pages publish dist --project-name=codex"

echo "Deployment complete!"
echo "API should be available at: https://api.codex.silv.app"
echo "Frontend should be available at: https://codex.silv.app"