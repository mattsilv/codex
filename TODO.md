# Codex Monorepo Refactoring TODO List

## Initial Setup
- [x] Create TODO.md with high-level tasks
- [x] Setup monorepo structure (frontend & backend folders)
- [x] Setup Cloudflare Workers environment
- [x] Configure necessary dependencies

## Backend Implementation
- [x] Setup D1 database with Drizzle ORM
- [x] Create database schema and migrations
- [x] Implement authentication API (JWT-based)
- [x] Implement CORS middleware
- [x] Implement Prompts API
- [x] Implement Responses API
- [x] Setup R2 storage for prompt/response content
- [x] Create utils for content storage/retrieval

## Frontend Implementation
- [x] Create API client utilities
- [x] Update auth context to use backend authentication
- [x] Update prompts hooks to use API
- [x] Update responses hooks to use API
- [x] Maintain localStorage as a fallback/offline mechanism
- [x] Move all frontend components to the frontend folder
- [x] Update imports to use new paths (@shared aliases)
- [x] Test API integration with local backend

## Development & Testing
- [x] Setup local development environment
- [x] Configure wrangler.toml
- [x] Create test data and scenarios
- [x] Create test scripts for frontend and backend
- [x] Test full stack locally
- [ ] Add error handling for API failures
- [ ] Add loading states for API requests

## Post-MVP Follow-ups
- [ ] Implement proper input validation
- [ ] Add request rate limiting
- [ ] Enhance security (CSRF protection, etc.)
- [ ] Add detailed error handling
- [ ] Setup proper CORS for production
- [ ] Add monitoring and logging
- [ ] Implement backup strategy for D1 database
- [ ] Add proper UI for loading/error states

## Deployment
- [ ] Deploy backend to Cloudflare Workers
- [ ] Deploy frontend to Cloudflare Pages or Netlify
- [ ] Configure production environment variables
- [ ] Setup custom domain (codex.silv.app)

## Next Steps (Specific Tasks)
1. ✅ Complete the transition of all frontend files to src/frontend directory
2. ✅ Create a script to help with the migration of existing localStorage data to the backend
3. ✅ Create test data and scenarios for testing
4. ✅ Add UI component for localStorage data migration
5. ✅ Create frontend and backend test utilities
6. ✅ Run the backend and frontend tests
7. ✅ Fix any issues found during testing
8. ✅ Test API integration with local backend
9. ✅ Create API test page for quick testing
10. Add UI indicators for network operations (loading, success, error states)
11. Implement proper error handling for network failures
12. Test the full authentication flow
13. Add form validation for all forms
14. Create better error messages for users