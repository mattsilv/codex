#!/bin/bash
# Codex codebase cleanup script
# This script reorganizes test files according to the REORGANIZATION_PLAN.md

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Codex Codebase Cleanup ===${NC}"
echo "This script will move test files to their appropriate directories"

# Create any missing directories
echo -e "\n${YELLOW}Creating directories...${NC}"
mkdir -p tests/api tests/auth tests/oauth 2>/dev/null

# Move API test files
echo -e "\n${YELLOW}Moving API test files...${NC}"
if [ -f "test-api.js" ]; then
  echo "Moving test-api.js to tests/api/"
  mv test-api.js tests/api/
fi

if [ -f "test-api-direct.js" ]; then
  echo "Moving test-api-direct.js to tests/api/"
  mv test-api-direct.js tests/api/
fi

if [ -f "test-api-health.js" ]; then
  echo "Moving test-api-health.js to tests/api/"
  mv test-api-health.js tests/api/
fi

if [ -f "api-test-button.js" ]; then
  echo "Moving api-test-button.js to tests/api/"
  mv api-test-button.js tests/api/
fi

if [ -f "direct-test.js" ]; then
  echo "Moving direct-test.js to tests/api/"
  mv direct-test.js tests/api/
fi

if [ -f "direct-fetch-test.js" ]; then
  echo "Moving direct-fetch-test.js to tests/api/"
  mv direct-fetch-test.js tests/api/
fi

# Move authentication test files
echo -e "\n${YELLOW}Moving authentication test files...${NC}"
if [ -f "test-login.js" ]; then
  echo "Moving test-login.js to tests/auth/"
  mv test-login.js tests/auth/
fi

if [ -f "login-test.js" ]; then
  echo "Moving login-test.js to tests/auth/"
  mv login-test.js tests/auth/
fi

if [ -f "test-backend-login.js" ]; then
  echo "Moving test-backend-login.js to tests/auth/"
  mv test-backend-login.js tests/auth/
fi

# Move OAuth test files
echo -e "\n${YELLOW}Moving OAuth test files...${NC}"
if [ -f "google-oauth-test.js" ]; then
  echo "Moving google-oauth-test.js to tests/oauth/"
  mv google-oauth-test.js tests/oauth/
fi

if [ -f "direct-oauth-test.js" ]; then
  echo "Moving direct-oauth-test.js to tests/oauth/"
  mv direct-oauth-test.js tests/oauth/
fi

# Move seed data files
echo -e "\n${YELLOW}Moving seed data files...${NC}"
if [ -f "seed-test-data.js" ]; then
  echo "Moving seed-test-data.js to tests/api/"
  mv seed-test-data.js tests/api/
fi

# Create index files that import all tests in each category
echo -e "\n${YELLOW}Creating index files...${NC}"

# API tests index
cat > tests/api/index.js << 'EOF'
/**
 * API Tests Index
 * 
 * This file imports and runs all API tests. You can run all API tests with:
 * node tests/api/index.js
 */

console.log('Running all API tests...');

// Import all API test files - add your test below
try {
  require('./test-api.js');
} catch (e) {
  console.error('Error running test-api.js:', e.message);
}

try {
  require('./test-api-direct.js');
} catch (e) {
  console.error('Error running test-api-direct.js:', e.message);
}

try {
  require('./test-api-health.js');
} catch (e) {
  console.error('Error running test-api-health.js:', e.message);
}

console.log('All API tests completed');
EOF

# Auth tests index
cat > tests/auth/index.js << 'EOF'
/**
 * Authentication Tests Index
 * 
 * This file imports and runs all authentication tests. You can run all auth tests with:
 * node tests/auth/index.js
 */

console.log('Running all authentication tests...');

// Import all auth test files - add your test below
try {
  require('./test-login.js');
} catch (e) {
  console.error('Error running test-login.js:', e.message);
}

try {
  require('./login-test.js');
} catch (e) {
  console.error('Error running login-test.js:', e.message);
}

try {
  require('./test-backend-login.js');
} catch (e) {
  console.error('Error running test-backend-login.js:', e.message);
}

console.log('All authentication tests completed');
EOF

# OAuth tests index
cat > tests/oauth/index.js << 'EOF'
/**
 * OAuth Tests Index
 * 
 * This file imports and runs all OAuth tests. You can run all OAuth tests with:
 * node tests/oauth/index.js
 */

console.log('Running all OAuth tests...');

// Import all OAuth test files - add your test below
// Note: These tests may require special setup, see the individual test files
try {
  require('./google-oauth-test.js');
} catch (e) {
  console.error('Error running google-oauth-test.js:', e.message);
}

try {
  require('./direct-oauth-test.js');
} catch (e) {
  console.error('Error running direct-oauth-test.js:', e.message);
}

console.log('All OAuth tests completed');
EOF

# Update package.json scripts
echo -e "\n${YELLOW}Updating package.json scripts...${NC}"
if command -v jq >/dev/null 2>&1; then
  # Create a temporary file with updated scripts
  jq '.scripts += {
    "test:api": "node tests/api/index.js",
    "test:auth": "node tests/auth/index.js", 
    "test:oauth": "node tests/oauth/index.js"
  }' package.json > package.json.tmp
  
  # Replace the original package.json
  mv package.json.tmp package.json
  echo "Added new test scripts to package.json"
else
  echo -e "${YELLOW}jq not found. Please manually add the following scripts to package.json:${NC}"
  echo '"test:api": "node tests/api/index.js",'
  echo '"test:auth": "node tests/auth/index.js",'
  echo '"test:oauth": "node tests/oauth/index.js"'
fi

# Update README to mention the new organization
echo -e "\n${YELLOW}Creating codebase cleanup documentation...${NC}"
cat > CODEBASE_CLEANUP.md << 'EOF'
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
EOF

echo -e "\n${GREEN}Codebase cleanup completed!${NC}"
echo "Please review the changes and check CODEBASE_CLEANUP.md for documentation."