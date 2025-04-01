# CLAUDE.md: Agent Instructions

## Build Commands

- **Install**: `pnpm install`
- **Dev**: `pnpm dev:all` (starts both frontend & backend)
- **Build**: `pnpm build`
- **Preview**: `pnpm preview`
- **Lint**: `pnpm lint`
- **Type Check**: `pnpm typecheck`

## Authentication & Database Setup

For local development, use the following test credentials:
- Email: `alice@example.com`
- Password: `password123`

To verify authentication is working:
```bash
node verify-auth-setup.js
```

If authentication fails or you need a fresh database, reset it:
```bash
pnpm db:reset
```

The app now exclusively uses D1 (Cloudflare's serverless SQLite) for both local development 
and production. The migration banner has been disabled since we no longer use localStorage.

### D1 Database Configuration
We've set up separate development and production D1 databases for better environment isolation:
- Development database: `codex-dev-db` (ID: aaa6821d-001d-4da5-a7cc-ac5be57aa2d8)
- Production database: `codex-prod-db` (ID: 74ff9511-8900-48c7-875b-e37a3544b576)

### Database Setup Commands
- **Reset database**: `pnpm db:reset`
- **Seed test data**: `pnpm db:seed`
- **Migrate local database**: `pnpm db:migrate:local`
- **Migrate dev database**: `pnpm db:migrate:dev`
- **Migrate prod database**: `pnpm db:migrate:prod`
- **Open D1 Studio**: `pnpm db:studio`

### Authentication System
The application uses Lucia Auth for authentication with support for:
- Username/password authentication
- Google OAuth integration (configurable)
- Session-based authentication
- Security features like CSRF protection

For detailed authentication information:
- General setup: `/docs/local-auth-setup.md`
- OAuth configuration: `/docs/OAUTH-README.md`

#### OAuth Port Requirements
For Google OAuth to work properly in development, these specific ports must be used:
- Frontend: `5173` or `3001` (Vite default ports)
- Backend: `8787` (Wrangler default port)

These ports MUST be included in the Google OAuth console configuration.

#### Local Infrastructure Management
**IMPORTANT:** When testing OAuth or any features requiring both frontend and backend:
1. Let the user run the infrastructure in separate terminal tabs
2. Never attempt to automatically start the servers within Claude
3. If ports are already in use, advise the user to run the port cleanup script:
   ```bash
   # Kill processes on ports 5173, 3001, and 8787
   ./scripts/kill-dev-ports.sh
   ```
4. The user should run these commands in separate terminal windows:
   ```bash
   # Terminal 1 - Backend
   cd /Users/m/gh/codex
   ./scripts/start-backend-simple.sh
   
   # Terminal 2 - Frontend
   cd /Users/m/gh/codex
   pnpm run dev:frontend
   ```

## Code Style Guidelines

- **Framework**: Preact with functional components
- **CSS**: Tailwind CSS v4 (utility-first approach)
- **Storage**: Cloudflare D1 (SQLite) for database, Cloudflare R2 for blob storage
- **Formatting**: 2-space indentation, single quotes
- **Imports**: Group by: 1) Libraries 2) Components 3) Hooks 4) Utils
- **State Management**: Preact Context API & custom hooks
- **Naming**: Components = PascalCase, functions/variables = camelCase
- **Error Handling**: Try/catch with toast notifications
- **TypeScript**: Strict mode, explicit return types

## TypeScript Guidelines

- **File Extensions**: Use `.tsx` for components, `.ts` for utilities and other TypeScript files
- **Interfaces**: Put interfaces at the top of the file, before component/function definitions
- **Prop Types**: Always define prop interfaces for components with detailed JSDoc comments
- **Function Types**: Use explicit return types for public functions
- **React/JSX Types**: Use Preact's JSX namespace for component return types (`JSX.Element`)
- **Event Types**: Use Preact's `TargetedEvent` type for event handlers
- **Avoid any**: Minimize use of `any` type where possible
- **Path Aliases**: Use path aliases to avoid deep relative imports
- **Type Guards**: Use type guards for type narrowing
- **Context Types**: Always type all context providers and hooks consistently

## Tailwind CSS v4 Configuration

- Uses `@tailwindcss/postcss` plugin (not direct `tailwindcss` in PostCSS)
- Main CSS file: `src/frontend/styles/tailwind.css`
- Configuration files: `tailwind.config.js` and `postcss.config.js`
- Test script: `./tests/run-tailwind-test.sh` to verify configuration

## Cloudflare Workers Limitations

- Must use ESM imports with .js extensions in backend files
- No Node.js-specific APIs or modules (process, fs, etc.)
- Limited compatibility with npm packages that use Node.js features
- Use Web APIs instead of Node.js-specific modules (Web Crypto API, etc.)
- For authentication, we use Lucia which is Workers-compatible

## Project Directory Organization

- **src/**
  - **frontend/**: Frontend application code
    - **components/**: Reusable UI by feature area
      - layout/ - Structural components
      - auth/ - Login/registration
      - prompt/ - Prompt management
      - response/ - Response components
      - ui/ - Generic UI elements
    - **pages/**: Top-level route components
    - **hooks/**: Shared business logic
    - **utils/**: Helper functions
    - **context/**: State management providers
    - **styles/**: CSS and Tailwind styles
  - **backend/**: Cloudflare Worker backend API
  - **shared/**: Code shared between frontend and backend
- **tests/**: All test files organized by type
  - **unit/**: Unit tests for individual components and functions
  - **integration/**: Tests for API and service integration
  - **e2e/**: End-to-end tests for complete workflows
  - **debug/**: Debugging utilities and test pages
- **scripts/**: Utility scripts for development and deployment
  - **setup/**: Setup and initialization scripts
- **docs/**: Documentation files
- **public/**: Static assets
- **migrations/**: Database schema migrations
  - Regular migrations
  - **lucia/**: Auth-specific migrations

## Key Features

- User authentication (email/password and Google OAuth)
- Create public/private prompts
- Add responses from different LLMs
- Markdown detection and rendering
- Sharing public prompts via links
- User account lifecycle management (deletion with retention period)

## Testing

- **Documentation**: See `/tests/README.md` for comprehensive testing documentation
- **Running Tests**:
  - Run all tests: `./tests/run-tests.sh`
  - Unit tests: `node tests/unit/test.js`
  - Integration tests: `node tests/integration/test-api.js`
  - E2E tests: `node tests/e2e/test-full.js`

### Account Management Testing

- **Simple Testing**:
  - Run `./scripts/start-test-backend.sh` to start a simplified backend with in-memory storage
  - Run `node tests/unit/simple-delete-test.js` to test account creation and deletion
  - View registered users with `node tests/integration/check-users.js`
  - All deleted users are soft-deleted with a 7-day retention period
  - Account details are anonymized immediately upon deletion
- **Test Endpoints**:
  - `/api/auth/test-delete/:userId` - Direct account deletion test endpoint
  - `/api/auth/process-deletions` - Test endpoint to trigger processing of expired accounts