# Codex - LLM Prompt Tracker

A tool for tracking prompts and comparing responses from different Large Language Models (LLMs).

## Features

- Track and organize prompts
- Store responses from different LLMs for comparison
- Share prompts and responses with others
- Full-stack app with Cloudflare Workers backend and Preact frontend
- Storage via Cloudflare D1 (SQLite) and R2 (object storage)

## Table of Contents

- [Setup](#setup)
- [Development](#development)
- [Testing](#testing)
- [Migrating Data](#migrating-data)
- [Deployment](#deployment)

## Setup

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Cloudflare account (for deployment)

### First-time Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the setup script:
   ```bash
   ./setup.sh
   ```
   This will:
   - Create Cloudflare D1 database
   - Set up Cloudflare R2 storage
   - Apply database migrations
   - Configure wrangler.toml

## Development

The application is structured as a monorepo with:
- Frontend (Preact)
- Backend (Cloudflare Workers)
- Shared code

### Quick Start

To start both frontend and backend servers:

```bash
./start-dev.sh
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:8787
- API Test Page at http://localhost:3000/test.html

### Starting Servers Individually

Start the frontend development server:
```bash
npm run dev
```

Start the backend development server:
```bash
npm run dev:worker
```

## Testing

### Test API

We provide an API test page to quickly verify backend functionality:

1. Start both servers with `./start-dev.sh`
2. Visit http://localhost:3000/test.html
3. Use the buttons to test API endpoints:
   - Seed Test Data: Creates test users, prompts, and responses
   - Register: Creates a new user
   - Login: Authenticates as a test user
   - Get Prompts: Retrieves user prompts
   - Create Prompt: Creates a new prompt

### Backend Tests

Run backend component tests:
```bash
node src/backend/local-test.js
```

## Migrating Data

If you're migrating from the localStorage-only version to the backend API version, you can use the data migration utilities:

1. Log in to your account
2. Visit the Dashboard
3. Click the migration banner to transfer your data from localStorage to the backend

## Deployment

### Deploy to Cloudflare

Deploy the backend to Cloudflare Workers:
```bash
npm run deploy:worker
```

Deploy the frontend to Cloudflare Pages:
```bash
npm run build
npm run deploy:frontend
```

## License

MIT