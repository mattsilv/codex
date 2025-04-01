# Codex D1 Database Setup

## Overview

Codex uses Cloudflare D1 (SQLite) for both local development and production. We've configured separate databases for development and production environments to ensure consistency and reliable testing.

## Getting Started

1. Make sure you have [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed:
   ```bash
   npm install -g wrangler
   ```

2. Login to your Cloudflare account:
   ```bash
   wrangler login
   ```

3. Install project dependencies:
   ```bash
   pnpm install
   ```

## Database Setup

We use two separate D1 databases:
- **codex-dev-db**: Development database
- **codex-prod-db**: Production database

Both databases have already been created in your Cloudflare account. You'll need to initialize them with our migration scripts.

### Initialize the Databases

Run the setup script to apply migrations to both databases:
```bash
./scripts/setup/setup-d1-database.sh
```

Alternatively, you can run migrations separately:
```bash
# For development database
pnpm db:migrate:dev

# For production database
pnpm db:migrate:prod
```

### Local Development Setup

For local development, run:
```bash
pnpm db:migrate:local
```

This will set up the local version of the D1 database.

## Running the Application

To start the development server:
```bash
pnpm dev:all
```

The application will automatically connect to your development D1 database.

## Resetting the Database

If you need to reset your database, use:
```bash
pnpm db:reset
```

This will reset the database through the API endpoint and re-seed it with test data.

## Database Schema

The database schema is defined in `/src/backend/db/schema.ts`. It uses Drizzle ORM for schema definition.

### Tables:

- **users**: User account information 
- **prompts**: Prompt data created by users
- **responses**: Responses to prompts

## Test Credentials

For local development, you can use the following test account:
- Email: `alice@example.com`
- Password: `password123`

These credentials are pre-populated in the login form for convenience.

## Cloudflare Dashboard Access

You can also manage your D1 databases directly in the Cloudflare dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages > D1
3. Select either "codex-dev-db" or "codex-prod-db"

From here, you can:
- View and edit tables
- Run SQL queries
- Monitor database usage

## Helpful Commands

```bash
# View all tables in development database
npx wrangler d1 execute codex-dev-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# View all users in development database
npx wrangler d1 execute codex-dev-db --command "SELECT * FROM users;"

# View prompts in development database
npx wrangler d1 execute codex-dev-db --command "SELECT * FROM prompts;"

# Insert test data into development database manually
npx wrangler d1 execute codex-dev-db --command "INSERT INTO users (id, email, username, passwordHash, emailVerified) VALUES ('test-user-1', 'test@example.com', 'testuser', 'hashedpassword', 1);"

# Delete data from development database
npx wrangler d1 execute codex-dev-db --command "DELETE FROM responses; DELETE FROM prompts; DELETE FROM users;"
```

## FAQ

### Q: What is the advantage of using D1 over localStorage?

A: Using D1 provides:
- Consistency between development and production
- Proper database functionality with relationships and queries
- Data persistence independent of the browser
- Team collaboration with shared data

### Q: How do I switch between development and production?

A: The environment is determined by your wrangler.toml configuration. For development, you don't need to do anything special. For production, use the `--env production` flag with wrangler commands.