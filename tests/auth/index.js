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
