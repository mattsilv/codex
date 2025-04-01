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
