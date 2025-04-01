// Simple backend test script
const API_URL = 'http://localhost:8787/api';

async function testBackend() {
  console.log('Testing backend API connection...');
  console.log(`API URL: ${API_URL}`);

  try {
    // 1. Test simple health endpoint
    console.log('\n1. Testing /api health...');
    const healthResponse = await fetch(`${API_URL}`);
    console.log(`Status: ${healthResponse.status}`);
    const healthText = await healthResponse.text();
    console.log(`Response: ${healthText}`);

    // 2. Test login with sample credentials
    console.log('\n2. Testing /api/auth/login...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'password123',
      }),
    });
    console.log(`Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log('Response:', loginData);

    // 3. Test registration
    console.log('\n3. Testing /api/auth/register...');
    const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: randomEmail,
        username: `testuser${Math.floor(Math.random() * 10000)}`,
        password: 'password123',
      }),
    });
    console.log(`Status: ${registerResponse.status}`);
    const registerData = await registerResponse.json();
    console.log('Response:', registerData);

    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Backend testing failed:', error);
  }
}

testBackend();
