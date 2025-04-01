# Codex - Modern Prompt & Response Management

A modern web application for managing prompts and responses from different AI models. Easily create, organize, and share prompts with their responses.

## Features

- User authentication with email/password and Google login
- Create and manage prompts
- Add responses from different AI models to prompts
- Public and private prompts with sharing capabilities
- Markdown support for prompt and response content
- Modern, responsive UI with Tailwind CSS

## Technologies

- **Frontend**: Preact with TypeScript
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
  - Development: `codex-dev-db` (ID: aaa6821d-001d-4da5-a7cc-ac5be57aa2d8)
  - Production: `codex-prod-db` (ID: 74ff9511-8900-48c7-875b-e37a3544b576)
- **Storage**: Cloudflare R2
  - Development: `codex-dev-bucket`
  - Production: `codex-prod-bucket`
- **Authentication**: Lucia Auth with Google OAuth support
- **Styling**: Tailwind CSS v4
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

- Node.js (v16+)
- pnpm
- Wrangler CLI for Cloudflare development

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/codex.git
   cd codex
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up the local database
   ```bash
   pnpm db:migrate:local
   pnpm db:seed
   ```

4. Start the development server
   ```bash
   pnpm dev:all
   ```

5. Open http://localhost:5173 in your browser

### Development Workflow

- **Start development server**: `pnpm dev:all`
- **Build for production**: `pnpm build`
- **Preview production build**: `pnpm preview`
- **Run linting**: `pnpm lint`
- **Run type checking**: `pnpm typecheck`
- **Format code**: `pnpm format`

## Database Commands

- **Reset database**: `pnpm db:reset`
- **Seed test data**: `pnpm db:seed`
- **Migrate local database**: `pnpm db:migrate:local`
- **Migrate development database**: `pnpm db:migrate:dev`
- **Migrate production database**: `pnpm db:migrate:prod`
- **Open D1 Studio**: `pnpm db:studio`

## Authentication

The application uses Lucia Auth for authentication with:

- Username/password login
- Google OAuth integration (configurable)
- JWT-based session management
- Account settings management

For local testing, use these credentials:
- Email: `alice@example.com`
- Password: `password123`

## Deployment Guide

1. Configure your Cloudflare account with required services:
   - D1 Database
   - R2 Storage Bucket
   - Workers/Pages for deployment

2. Update the wrangler.toml configuration if needed

3. Deploy to Cloudflare:
   ```bash
   pnpm deploy
   ```

### Database Configuration

For first-time setup, you'll need to:

1. Create the development and production databases:
   ```bash
   npx wrangler d1 create codex-dev-db
   npx wrangler d1 create codex-prod-db
   ```

2. Update your wrangler.toml with the database IDs

3. Run migrations:
   ```bash
   pnpm db:migrate:dev # For development database
   pnpm db:migrate:prod # For production database
   ```

## Google OAuth Setup

1. Create a Google OAuth application in the Google Cloud Console

2. Configure the OAuth consent screen

3. Configure the authorized JavaScript origins and redirect URIs:
   - **Required JavaScript Origins:**
     ```
     http://localhost:5173
     http://localhost:3001
     http://localhost:8787
     ```
   
   - **Required Redirect URI:**
     ```
     http://localhost:8787/api/auth/callback/google
     ```

4. Add your OAuth credentials to wrangler.toml:
   ```toml
   [vars]
   GOOGLE_CLIENT_ID = "your-client-id"
   GOOGLE_CLIENT_SECRET = "your-client-secret"
   ```

> **IMPORTANT:** For local development, the application MUST use:
> - Port **3001** for the frontend (configured in vite.config.js)
> - Port **5173** as an alternative frontend port (Vite default)
> - Port **8787** for the backend (Wrangler default)
>
> These exact port numbers are configured in Google OAuth Console and cannot be changed easily.
> If these ports are already in use, run: `./scripts/kill-dev-ports.sh`

For detailed OAuth setup instructions, see:
[Google OAuth Setup Guide](/docs/OAUTH-README.md)

## Testing

- **Run all tests**: `pnpm test`
- **API tests**: `pnpm test:api`
- **Unit tests**: `pnpm test:unit`
- **E2E tests**: `pnpm test:e2e`
- **Registration test**: `pnpm test:registration`
- **Tailwind test**: `pnpm test:tailwind`

## Project Structure

- `src/frontend`: Frontend application code
- `src/backend`: Cloudflare Worker backend API
- `src/shared`: Shared code between frontend and backend
- `migrations`: Database migrations
- `tests`: Test files (unit, integration, E2E)
- `public`: Static assets
- `docs`: Documentation

## Troubleshooting

- **Database Issues**: Reset with `pnpm db:reset` and seed fresh data
- **Authentication Issues**: Check wrangler.toml for correct environment variables
- **Deployment Issues**: Verify account permissions and resource access

## License

MIT