# Testing Documentation

This document outlines the testing structure and procedures for the Codex project.

## Testing Directory Structure

```
/tests
├── unit/             # Unit tests for individual components and functions
├── integration/      # Integration tests for API and services
├── e2e/              # End-to-end tests for complete workflows
├── debug/            # Debugging utilities and test pages
└── README.md         # This documentation file
```

## Types of Tests

### Unit Tests

Located in `/tests/unit/`, these tests focus on individual components, functions, and utilities in isolation. They verify that each piece works correctly on its own.

Files:

- `test.js` - General unit tests
- `simple-test.js` - Basic unit tests for quick validation
- `simple-delete-test.js` - Tests for deletion operations
- `test-tailwind.js`, `test-tailwind-cli.js`, `test-oklch.js`, `simple-tailwind-test.js` - Tests for Tailwind CSS functionality

### Integration Tests

Located in `/tests/integration/`, these tests verify that different parts of the application work together correctly. They focus on API interactions, data flows, and service communication.

Files:

- `test-api.js` - Tests for REST API endpoints
- `test-backend.js` - Backend service tests
- `test-create-user.js` - User creation flow tests
- `test-account.js` - Account management tests
- `check-users.js` - User data validation tests

### End-to-End Tests

Located in `/tests/e2e/`, these tests simulate real user workflows, testing the application from start to finish as a user would experience it.

Files:

- `test-full.js` - Complete workflow tests
- `test-index.html` - HTML-based E2E test runner

### Debug Tools

Located in `/tests/debug/`, these are utilities and pages for troubleshooting and development.

Files:

- `debug-backend.js` - Backend debugging utilities
- `debug-navigation.js` - Navigation flow debugging
- `debug-auth.html` - Authentication debugging page

## Running Tests

### All Tests

```bash
cd /Users/m/gh/codex
./tests/run-tests.sh
```

### Unit Tests

```bash
node tests/unit/test.js
```

### Integration Tests

```bash
node tests/integration/test-api.js
```

### E2E Tests

```bash
node tests/e2e/test-full.js
```

### Tailwind CSS Tests

```bash
./tests/run-tailwind-test.sh
```

## CI/CD Integration

Tests are automatically run as part of the CI/CD pipeline. The build will fail if any tests fail, preventing problematic code from being deployed.

## Writing New Tests

When adding new features or fixing bugs:

1. Add unit tests for new components or functions
2. Add or update integration tests for API changes
3. Ensure E2E tests cover the new functionality
4. Run the full test suite before submitting a PR

For UI components, consider adding visual regression tests as well.

## Test Data

Test data is managed through seed scripts in the `/scripts/setup/` directory. These scripts create consistent data environments for testing.

To set up test data:

```bash
cd /Users/m/gh/codex
./scripts/setup/setup-test-data.sh
```
