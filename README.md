# Codex - LLM Prompt Tracker

A web application for saving, organizing, and comparing responses from different Large Language Models.

## Setup & Development Guide

### Prerequisites

- Node.js 18 or later
- npm or pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

We've created several convenience scripts to handle development:

#### Option 1: Start both frontend and backend together (recommended)

```bash
pnpm dev:all
```

This starts both the frontend and backend servers simultaneously. Frontend will be at http://localhost:3000 and backend at http://localhost:8787.

#### Option 2: Start frontend and backend separately

Terminal 1:

```bash
pnpm dev:backend
```

Terminal 2:

```bash
pnpm dev:frontend
```

#### Seed test data

The backend automatically attempts to seed test data on startup. If you need to manually seed data:

```bash
pnpm seed-data
```

### Test accounts

After seeding test data, you can log in with:

1. **Alice:**

   - Email: alice@example.com
   - Password: password123

2. **Bob:**
   - Email: bob@example.com
   - Password: password123

## Project Structure

- `/src/` - Source code
  - `/frontend/` - Frontend application
    - `/components/` - Preact components
    - `/context/` - Application context providers
    - `/hooks/` - Custom React hooks
    - `/pages/` - Page components
    - `/utils/` - Utility functions
    - `/styles/` - CSS and Tailwind styles
  - `/backend/` - Cloudflare Worker backend
  - `/shared/` - Shared code between frontend and backend
- `/tests/` - Test files ([Testing Documentation](/tests/README.md))
  - `/unit/` - Unit tests
  - `/integration/` - Integration tests
  - `/e2e/` - End-to-end tests
  - `/debug/` - Debugging utilities
- `/scripts/` - Utility scripts
  - `/setup/` - Setup and initialization scripts
- `/migrations/` - Database migrations
- `/docs/` - Documentation files
- `/public/` - Static assets

## Technologies

- **Frontend:** Preact, Tailwind CSS, TypeScript
- **Backend:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2
- **Build System:** Vite

## Cloudflare Workers Limitations

- **ESM Imports:** Must use .js extensions in import statements
- **No Node.js APIs:** Can't use Node-specific features (process, fs, etc.)
- **Limited npm Compatibility:** Many Node.js-dependent packages won't work
- **Authentication:** Can't use bcryptjs; use Web Crypto API instead
- **Web Standards:** Use Web APIs instead of Node.js modules

## Troubleshooting

If you encounter issues with authentication or the backend:

1. Try running the simplified backend server:

   ```bash
   ./scripts/start-backend-simple.sh
   ```

2. If database issues persist, reset your local development database:

   ```bash
   rm -rf .wrangler/state/v3/d1
   ```

3. Check browser console for error messages when using the Auth page

4. Debug API connectivity with the debug tools:

   ```bash
   node tests/debug/debug-navigation.js
   ```

5. Run specific tests to identify issues:
   ```bash
   ./tests/run-tests.sh
   ```

For detailed troubleshooting information, see the TODO.md file and [Testing Documentation](/tests/README.md).

## Cloudflare Production Deployment Guide

Follow this detailed guide to deploy the application to Cloudflare. This outlines the best practices for setting up both frontend and backend components properly.

### Current Deployment Status

- Backend API deployed at: https://codex-api.silv.workers.dev
- Frontend deployed at: https://8cc8ffed.codex-abq.pages.dev

### 1. Cloudflare Resources Setup

First, create all necessary resources in Cloudflare:

#### Backend (Cloudflare Workers)

```bash
# Deploy backend to Cloudflare Workers
npx wrangler deploy --env production

# Create production database
npx wrangler d1 create codex_db_prod

# Apply database migrations
npx wrangler d1 execute codex_db_prod --file ./migrations/0000_initial_schema.sql
```

#### Frontend (Cloudflare Pages)

```bash
# Build the frontend
pnpm build

# Create Pages project (required before deployment)
npx wrangler pages project create codex --production-branch=main

# Deploy built frontend to Pages
npx wrangler pages deploy dist --project-name=codex
```

#### R2 Storage Setup

```bash
# This requires R2 to be enabled in your Cloudflare account first
npx wrangler r2 bucket create codex-content-prod
```

### 2. Required Manual Configuration in Cloudflare Dashboard

Some settings must be configured through the Cloudflare dashboard:

#### Custom Domains Setup

1. **Frontend Domain Setup**:

   - Go to: Cloudflare Dashboard → Pages → codex project → Custom Domains
   - Add domain: `codex.silv.app`
   - Follow the verification steps

2. **API Domain Setup**:
   - Go to: Cloudflare Dashboard → Workers & Pages → codex-api worker → Triggers
   - Add custom domain: `api.codex.silv.app`
   - Follow the verification steps

#### DNS Configuration

Go to: Cloudflare Dashboard → DNS → Records, and add:

- CNAME record: `codex` points to your Pages URL (e.g., `codex-abq.pages.dev`)
- CNAME record: `api.codex` points to your Worker URL (e.g., `codex-api.silv.workers.dev`)

#### CORS and Headers Configuration

If needed, add CORS headers through the Cloudflare Dashboard:

- Go to: Pages/Workers → codex-api → Settings → Headers
- Add the appropriate CORS headers for cross-domain communication

### 3. Update Configuration File

After manually setting up resources, update your `wrangler.toml`:

```toml
# Update R2 bucket in wrangler.toml once created
[[env.production.r2_buckets]]
binding = "CONTENT_STORE"
bucket_name = "codex-content-prod"
```

Then redeploy the backend:

```bash
npx wrangler deploy --env production
```

### 4. Troubleshooting Common Issues

#### CNAME Cross-User Banned Error (Error 1014)

This occurs when a CNAME record points to a Cloudflare domain owned by a different account.

- Ensure domain registration and Pages/Workers deployment use the same Cloudflare account
- Check DNS configuration in Cloudflare dashboard matches your deployment account
- Verify the Pages project exists in the same account as your domain

#### Pages Project Not Found

If you see "Project not found" when deploying:

- Create the project first: `npx wrangler pages project create codex --production-branch=main`
- Then deploy: `npx wrangler pages deploy dist --project-name=codex`

#### API Connection Issues

If the frontend can't connect to the API:

- Check CORS settings in `src/backend/middleware/cors.js`
- Verify the API URL in `src/shared/constants.js` matches your production domain
- Test API endpoints using the verification script: `node scripts/test-api.js`

### 5. Verify Deployment

After completing all steps, verify your deployment:

```bash
# Check DNS propagation
./scripts/check-dns.sh

# Test API endpoints
node scripts/test-api.js

# Verify full deployment
./scripts/verify-deployment.sh
```

For more detailed instructions, refer to `/docs/production-setup-summary.md`.
