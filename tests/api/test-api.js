// API test script for Codex
// Tests email verification flow and user registration

const API_URL = 'http://localhost:8787';

async function runTests() {
  console.log('Starting API tests...');

  // Test 1: Seed Test Data
  console.log('\n--- Test 1: Seed Test Data ---');
  try {
    const seedResponse = await fetch(`${API_URL}/api/seed-test-data`);
    const seedData = await seedResponse.json();
    console.log('Response status:', seedResponse.status);
    console.log('Response data:', seedData);
  } catch (error) {
    console.error('Error seeding test data:', error);
  }

  // Test 2: Register a new user
  console.log('\n--- Test 2: Register a new user ---');
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const testEmail = `test-${timestamp}@example.com`;
    const testUsername = `tester${randomId}`;
    console.log('Using test email:', testEmail);
    console.log('Using test username:', testUsername);

    const registerResponse = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        username: testUsername,
        password: 'Password123!',
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register status:', registerResponse.status);
    console.log('Register data:', JSON.stringify(registerData, null, 2));

    // If we got a verification requirement in the response, test verification
    if (registerData.user && registerData.user.requiresVerification) {
      console.log('\n--- Test 3: Verify email ---');

      // For testing, we'll cheat and get the verification code from the database
      const checkUserResponse = await fetch(
        `${API_URL}/api/auth/test-get-verification-code?email=${testEmail}`
      );
      const userData = await checkUserResponse.json();

      if (userData.data && userData.data.verificationCode) {
        const code = userData.data.verificationCode;
        console.log(`Got verification code: ${code}`);

        // Submit the verification code
        const verifyResponse = await fetch(`${API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            code: code,
          }),
        });

        const verifyData = await verifyResponse.json();
        console.log('Verification status:', verifyResponse.status);
        console.log('Verification data:', verifyData);

        // Test login with verified account
        if (verifyData.success) {
          console.log('\n--- Test 4: Login with verified account ---');

          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              password: 'Password123!',
            }),
          });

          const loginData = await loginResponse.json();
          console.log('Login status:', loginResponse.status);
          console.log('Login data:', loginData);
        }
      } else {
        console.log('Could not get verification code for testing');
      }
    }
  } catch (error) {
    console.error('Error in registration test:', error);
  }

  console.log('\nAll tests completed');
}

runTests();
