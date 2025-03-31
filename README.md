# Codex - LLM Prompt Tracker

A web application for saving, organizing, and comparing responses from different Large Language Models.

## Setup & Development Guide

### Prerequisites

- Node.js 18 or later
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install
```

### Development

We've created several convenience scripts to handle development:

#### Option 1: Start both frontend and backend together (recommended)

```bash
npm run dev:all
```

This starts both the frontend and backend servers simultaneously. Frontend will be at http://localhost:3000 and backend at http://localhost:8787.

#### Option 2: Start frontend and backend separately

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

#### Seed test data

The backend automatically attempts to seed test data on startup. If you need to manually seed data:

```bash
npm run seed-data
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
  - `/backend/` - Cloudflare Worker backend
  - `/components/` - Preact components
  - `/context/` - Application context providers
  - `/hooks/` - Custom React hooks
  - `/pages/` - Page components
  - `/utils/` - Utility functions
- `/migrations/` - Database migrations
- `/public/` - Static assets

## Technologies

- **Frontend:** Preact, PicoCSS
- **Backend:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2
- **Build System:** Vite

## Troubleshooting

If you encounter issues with authentication or the backend:

1. Try restarting the backend server:
   ```bash
   npm run dev:backend
   ```

2. If database issues persist, reset your local development database:
   ```bash
   rm -rf .wrangler/state/d1
   ```

3. Check browser console for error messages when using the Auth page

4. API issues? Try the "Test API Connection" button on the Auth page