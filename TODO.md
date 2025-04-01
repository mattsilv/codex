# Codex Project Tasks

## MEDIUM PRIORITY

### Cloudflare Workers Migration

- [x] Migrate backend code to be fully Cloudflare Workers compatible
- [x] Add .js extensions to all import statements
- [x] Replace bcryptjs with Web Crypto API for authentication
- [x] Fix R2 storage access using proper env bindings
- [ ] Test each endpoint incrementally

### CORS Implementation

- [x] Simplify CORS middleware implementation
- [x] Add consistent credentials handling in frontend API client
- [x] Create CORS debugging and testing tools
- [x] Document CORS implementation in detail
- [ ] Add CORS configuration variables to wrangler.toml for different environments
- [ ] Create integration test for CORS with different origins
- [ ] Monitor CORS error rates in production
- [ ] Automate CORS validation as part of deployment process

### Authentication System

- [x] Create simplified password hashing function for Workers environment
- [x] Test JWT token generation in Workers environment
- [x] Update login/registration forms to work with the new backend
- [x] Implement secure password hashing with salt
- [x] Add password complexity requirements
- [x] Implement rate limiting for login attempts
- [ ] Implement secure session management
- [ ] Add email verification for new accounts
- [ ] Implement CSRF protection
- [ ] Add security headers (Content-Security-Policy, X-XSS-Protection)
- [ ] Create password reset functionality
- [ ] Add terms of service and privacy policy to registration
- [ ] Implement proper JWT secret management for production

### Data Migration

- [x] Implement localStorage to backend database migration (/src/frontend/utils/migrateLegacyData.js)
- [x] Add progress indicators for migration process (/src/frontend/components/ui/MigrationBanner.jsx)
- [x] Ensure proper error handling for migration failures
- [x] Add migration completion notifications in the UI (/src/frontend/components/ui/Toast.jsx)
- [x] Create detailed migration logs for troubleshooting (/src/frontend/utils/migrateLegacyData.ts)
- [ ] Test migration functionality once login is working
