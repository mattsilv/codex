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
