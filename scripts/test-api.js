// Simple script to test the API with proper CORS handling
import { fetch } from 'undici'; // Modern fetch implementation

// Configuration 
const ENV = process.env.NODE_ENV || 'development';
const API_HOSTS = {
  development: 'http://localhost:8787',
  production: 'https://api.codex.silv.app',
};
const FRONTEND_ORIGINS = {
  development: 'http://localhost:5173',
  production: 'https://codex.silv.app',
};

// Get configured hosts
const API_HOST = process.env.API_HOST || API_HOSTS[ENV];
const ORIGIN = process.env.ORIGIN || FRONTEND_ORIGINS[ENV];

/**
 * Test the API health endpoint
 */
async function testHealth() {
  console.log('\n==== Testing API Health ====');
  console.log(`API Host: ${API_HOST}`);
  console.log(`Simulated Origin: ${ORIGIN}`);
  
  try {
    const response = await fetch(`${API_HOST}/api/health`, {
      headers: { 
        Origin: ORIGIN
      }
    });
    
    console.log(`\nStatus: ${response.status}`);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const data = await response.json();
    console.log('\nResponse Body:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check CORS headers
    validateCorsHeaders(response.headers, ORIGIN);
    
    return response.ok;
  } catch (error) {
    console.error('\nHealth check failed:');
    console.error(`  ${error.message}`);
    return false;
  }
}

/**
 * Test the OPTIONS preflight request
 */
async function testPreflight() {
  console.log('\n==== Testing CORS Preflight ====');
  console.log(`API Host: ${API_HOST}`);
  console.log(`Simulated Origin: ${ORIGIN}`);
  
  try {
    const response = await fetch(`${API_HOST}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`\nStatus: ${response.status}`);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Check preflight CORS headers
    validatePreflightHeaders(response.headers, ORIGIN);
    
    return response.status === 204 || response.status === 200;
  } catch (error) {
    console.error('\nPreflight check failed:');
    console.error(`  ${error.message}`);
    return false;
  }
}

/**
 * Test login endpoint
 */
async function testLogin() {
  console.log('\n==== Testing Login API ====');
  console.log(`API Host: ${API_HOST}`);
  console.log(`Simulated Origin: ${ORIGIN}`);
  
  try {
    const response = await fetch(`${API_HOST}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': ORIGIN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123'
      })
    });
    
    console.log(`\nStatus: ${response.status}`);
    console.log('Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const data = await response.json().catch(() => 'Not JSON response');
    console.log('\nResponse Body:');
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    
    // Check CORS headers
    validateCorsHeaders(response.headers, ORIGIN);
    
    return response.ok;
  } catch (error) {
    console.error('\nLogin test failed:');
    console.error(`  ${error.message}`);
    return false;
  }
}

/**
 * Validate CORS headers on a response
 */
function validateCorsHeaders(headers, origin) {
  console.log('\nCORS Validation:');
  
  // Check Access-Control-Allow-Origin
  const allowOrigin = headers.get('access-control-allow-origin');
  if (!allowOrigin) {
    console.error('  ❌ Missing Access-Control-Allow-Origin header');
  } else if (allowOrigin !== origin && allowOrigin !== '*') {
    console.error(`  ❌ Incorrect Access-Control-Allow-Origin: got "${allowOrigin}", expected "${origin}" or "*"`);
  } else {
    console.log(`  ✅ Access-Control-Allow-Origin: ${allowOrigin}`);
  }
  
  // Check credentials header if needed
  if (allowOrigin !== '*') {
    const allowCredentials = headers.get('access-control-allow-credentials');
    if (!allowCredentials) {
      console.warn('  ⚠️ Missing Access-Control-Allow-Credentials header (needed for specific origins)');
    } else if (allowCredentials !== 'true') {
      console.error(`  ❌ Incorrect Access-Control-Allow-Credentials: got "${allowCredentials}", expected "true"`);
    } else {
      console.log(`  ✅ Access-Control-Allow-Credentials: ${allowCredentials}`);
    }
  }
}

/**
 * Validate preflight CORS headers
 */
function validatePreflightHeaders(headers, origin) {
  // Do basic CORS validation
  validateCorsHeaders(headers, origin);
  
  console.log('\nPreflight Validation:');
  
  // Check methods
  const allowMethods = headers.get('access-control-allow-methods');
  if (!allowMethods) {
    console.error('  ❌ Missing Access-Control-Allow-Methods header');
  } else if (!allowMethods.includes('POST')) {
    console.error(`  ❌ Access-Control-Allow-Methods does not include POST: ${allowMethods}`);
  } else {
    console.log(`  ✅ Access-Control-Allow-Methods: ${allowMethods}`);
  }
  
  // Check headers
  const allowHeaders = headers.get('access-control-allow-headers');
  if (!allowHeaders) {
    console.error('  ❌ Missing Access-Control-Allow-Headers header');
  } else if (!allowHeaders.includes('Content-Type') || !allowHeaders.includes('Authorization')) {
    console.error(`  ❌ Access-Control-Allow-Headers missing required headers: ${allowHeaders}`);
  } else {
    console.log(`  ✅ Access-Control-Allow-Headers: ${allowHeaders}`);
  }
  
  // Check max age
  const maxAge = headers.get('access-control-max-age');
  if (maxAge) {
    console.log(`  ✅ Access-Control-Max-Age: ${maxAge}`);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('==============================================');
  console.log('          CODEX API CORS TEST TOOL           ');
  console.log('==============================================');
  console.log(`Environment: ${ENV.toUpperCase()}`);
  
  let failures = 0;
  
  // Run health check
  if (!(await testHealth())) {
    console.error('\n❌ Health check failed');
    failures++;
  } else {
    console.log('\n✅ Health check passed');
  }
  
  // Run preflight check
  if (!(await testPreflight())) {
    console.error('\n❌ Preflight check failed');
    failures++;
  } else {
    console.log('\n✅ Preflight check passed');
  }
  
  // Run login test
  if (!(await testLogin())) {
    console.error('\n❌ Login test failed');
    failures++;
  } else {
    console.log('\n✅ Login test passed');
  }
  
  // Summary
  console.log('\n==============================================');
  if (failures === 0) {
    console.log('✅ All tests passed! CORS is configured correctly.');
  } else {
    console.log(`❌ ${failures} test(s) failed. See above for details.`);
  }
  console.log('==============================================\n');
  
  // Exit with appropriate code
  process.exit(failures ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
  process.exit(1);
});