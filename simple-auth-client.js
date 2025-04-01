// Simple auth client for testing CORS issues
// Run this from a terminal to test CORS without browser complexity
import { fetch } from 'undici';

// Test multiple origins to ensure CORS handling works correctly
const TEST_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://codex.silv.app'
];

// API endpoints to test (adjust as needed)
const API_HOST = process.argv[2] || 'http://localhost:8787'; // Pass host as first arg
const ENDPOINTS = [
  '/api/health',
  '/api/auth/login'
];

// Test credentials
const TEST_CREDENTIALS = {
  email: 'alice@example.com',
  password: 'password123'
};

/**
 * Test a specific endpoint with a specific origin
 */
async function testEndpoint(endpoint, origin) {
  console.log(`\n--------------------------------------------`);
  console.log(`TESTING: ${endpoint} with Origin: ${origin}`);
  console.log(`--------------------------------------------`);
  
  // First do a preflight check for non-GET endpoints
  if (endpoint !== '/api/health') {
    try {
      console.log(`> Preflight OPTIONS request`);
      const preflightResponse = await fetch(`${API_HOST}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });
      
      console.log(`< Status: ${preflightResponse.status}`);
      console.log(`< Headers:`);
      for (const [key, value] of preflightResponse.headers.entries()) {
        if (key.toLowerCase().startsWith('access-control')) {
          console.log(`<   ${key}: ${value}`);
        }
      }
    } catch (error) {
      console.error(`! Preflight error: ${error.message}`);
    }
  }
  
  // Now do the actual request
  try {
    console.log(`\n> ${endpoint === '/api/health' ? 'GET' : 'POST'} request`);
    
    // Build request options
    const options = {
      method: endpoint === '/api/health' ? 'GET' : 'POST',
      headers: {
        'Origin': origin,
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for CORS testing
    };
    
    // Add body for POST requests
    if (options.method === 'POST') {
      options.body = JSON.stringify(TEST_CREDENTIALS);
    }
    
    const response = await fetch(`${API_HOST}${endpoint}`, options);
    
    console.log(`< Status: ${response.status}`);
    console.log(`< Headers:`);
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().startsWith('access-control')) {
        console.log(`<   ${key}: ${value}`);
      }
    }
    
    // Try to parse response body
    try {
      const data = await response.json();
      console.log(`< Body: ${JSON.stringify(data, null, 2).substring(0, 200)}`);
      if (JSON.stringify(data).length > 200) console.log(`... (truncated)`);
    } catch (e) {
      const text = await response.text();
      console.log(`< Body: ${text.substring(0, 200)}`);
      if (text.length > 200) console.log(`... (truncated)`);
    }
    
    // Check if CORS headers are correct
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsCredentials = response.headers.get('access-control-allow-credentials');
    
    if (!corsOrigin) {
      console.log(`! MISSING Access-Control-Allow-Origin header`);
    } else if (corsOrigin !== origin && corsOrigin !== '*') {
      console.log(`! INCORRECT Access-Control-Allow-Origin: expected "${origin}" or "*", got "${corsOrigin}"`);
    } else if (corsOrigin === origin && !corsCredentials) {
      console.log(`! MISSING Access-Control-Allow-Credentials (needed when using specific origin)`);
    } else {
      console.log(`✓ CORS headers look correct`);
    }
    
    return response.ok;
  } catch (error) {
    console.error(`! Request error: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`\n======================================================`);
  console.log(`CORS TEST CLIENT - Testing API at ${API_HOST}`);
  console.log(`======================================================\n`);
  
  let failures = 0;
  let successes = 0;
  
  // Test all combinations of endpoints and origins
  for (const endpoint of ENDPOINTS) {
    for (const origin of TEST_ORIGINS) {
      const result = await testEndpoint(endpoint, origin);
      if (result) {
        successes++;
      } else {
        failures++;
      }
    }
  }
  
  // Print summary
  console.log(`\n======================================================`);
  console.log(`TEST SUMMARY: ${successes} passed, ${failures} failed`);
  console.log(`======================================================\n`);
  
  // Show basic troubleshooting advice if there were failures
  if (failures > 0) {
    console.log(`TROUBLESHOOTING TIPS:
1. Check your CORS configuration - make sure allowed origins are set correctly
2. For local development, try setting 'Access-Control-Allow-Origin: *' if you're not using credentials
3. When using specific origins, add 'Access-Control-Allow-Credentials: true'
4. Ensure OPTIONS requests get proper CORS headers for preflight
5. Verify your server is running and accessible at ${API_HOST}
`);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`Critical error: ${error}`);
  process.exit(1);
});