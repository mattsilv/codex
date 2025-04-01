// Debug navigation script for testing Codex backend API
// Run this with: node debug-navigation.js

// Simple fetch API wrapper for testing
async function makeRequest(path, method = 'GET', body = null, headers = {}) {
  const baseUrl = 'http://localhost:8787';
  const url = baseUrl + path;

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`Making ${method} request to ${url}`);
    const response = await fetch(url, options);

    if (response.ok) {
      return {
        status: response.status,
        statusText: response.statusText,
        data: await response.json(),
      };
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: 'Could not parse error response' };
      }

      return {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      };
    }
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return {
      error: `Request failed: ${error.message}`,
    };
  }
}

async function testRoot() {
  console.log('\n🔍 Testing root endpoint...');
  return await makeRequest('/', 'GET');
}

async function testApi() {
  console.log('\n🔍 Testing API endpoint...');
  return await makeRequest('/api', 'GET');
}

async function testCORS() {
  console.log('\n🔍 Testing CORS with preflight OPTIONS request...');

  try {
    const response = await fetch('http://localhost:8787/api', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    const corsHeaders = {};
    for (const [key, value] of response.headers.entries()) {
      if (key.toLowerCase().startsWith('access-control')) {
        corsHeaders[key] = value;
      }
    }

    return {
      status: response.status,
      statusText: response.statusText,
      corsHeaders,
    };
  } catch (error) {
    console.error(`CORS test failed: ${error.message}`);
    return {
      error: `CORS test failed: ${error.message}`,
    };
  }
}

async function testSeedData() {
  console.log('\n🔍 Testing seed data endpoint...');
  return await makeRequest('/api/seed-test-data', 'GET');
}

async function runTests() {
  console.log('🧪 Starting API tests for Codex backend...');

  // Test API endpoints
  const rootResult = await testRoot();
  console.log('Root endpoint result:', rootResult);

  const apiResult = await testApi();
  console.log('API endpoint result:', apiResult);

  const corsResult = await testCORS();
  console.log('CORS test result:', corsResult);

  const seedResult = await testSeedData();
  console.log('Seed data result:', seedResult);

  console.log('\n✅ All tests completed');
}

// Run the tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
});
