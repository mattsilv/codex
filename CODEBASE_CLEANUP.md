# Codebase Cleanup

## Reorganization of Test Files

As part of the codebase reorganization plan, test files have been moved to their appropriate directories:

### API Tests
All API-related test files are now in `tests/api/`:
- `test-api.js` - General API tests
- `test-api-direct.js` - Direct API calls
- `test-api-health.js` - API health endpoint tests
- `api-test-button.js` - API test button functionality
- `direct-test.js` - Direct HTTP tests
- `direct-fetch-test.js` - Fetch API tests
- `seed-test-data.js` - Database seeding for tests

### Authentication Tests
All authentication-related test files are now in `tests/auth/`:
- `test-login.js` - Login endpoint tests
- `login-test.js` - Alternative login tests
- `test-backend-login.js` - Backend authentication tests

### OAuth Tests
All OAuth-related test files are now in `tests/oauth/`:
- `google-oauth-test.js` - Google OAuth tests
- `direct-oauth-test.js` - Direct OAuth endpoint tests

## Running Tests

You can run these tests individually or by category:

```bash
# Run all API tests
npm run test:api

# Run all authentication tests
npm run test:auth

# Run all OAuth tests
npm run test:oauth
```

## Next Steps

1. Further consolidate duplicate test files
2. Standardize test approaches
3. Improve test documentation
4. Add continuous integration setup
