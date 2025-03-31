# Codex Project TODO List

## Critical Backend Issues (Blocking)
- [ ] Fix backend server startup issues - currently failing to start properly
  - [ ] Debug "Cannot read properties of undefined (reading 'fetch')" error
  - [ ] Check Cloudflare Workers configuration in wrangler.toml
  - [ ] Verify all bindings (CONTENT_STORE, DB) are properly configured
  - [ ] Check if D1 database is being created and migrations applied correctly

## Authentication System
- [ ] Fix login/registration functionality not working
  - [ ] Debug form submission issues
  - [ ] Test API endpoints directly using curl/Postman
  - [ ] Verify JWT token generation is working properly

## Development Environment
- [ ] Set up reliable local development workflow
  - [ ] Fix backend development server
  - [ ] Test seeding functionality
  - [ ] Create simple way to reset local database when needed

## Data Migration
- [ ] Implement localStorage to backend database migration
  - [ ] Test migration functionality once login is working
  - [ ] Add progress indicators for migration process
  - [ ] Ensure proper error handling for migration failures

## Testing
- [ ] Create a test plan for all key features
  - [ ] Authentication (login, registration, profile)
  - [ ] Prompt CRUD operations
  - [ ] Response CRUD operations
  - [ ] Data migration from localStorage

## Next Work Session Priorities
1. Focus on getting backend server running reliably
2. Test authentication API endpoints directly
3. Fix login/registration functionality
4. Test data seeding and migration

## Troubleshooting Steps for Next Session
1. Check wrangler logs during startup for detailed error messages
2. Verify all required env bindings in wrangler.toml
3. Try running with --verbose flag: `npx wrangler dev --verbose`
4. Check Node.js version compatibility (ensure Node 18+)
5. Try manually creating the D1 database: `npx wrangler d1 create codex_db --local`
6. Test backend API endpoints directly with curl to isolate frontend vs backend issues