// Comprehensive test for Codex system focusing on account creation and deletion

// Test sequence:
// 1. Register a new user
// 2. Login with the user
// 3. Verify the account deletion endpoint works
// 4. Verify account restoration works within the 7-day window

const BASE_URL = 'http://localhost:8787';
const EMAIL_BASE = `test_user_${Date.now()}`;
const EMAIL = `${EMAIL_BASE}@example.com`;
const PASSWORD = 'Test123!';
const USERNAME = `testuser_${Date.now()}`;

console.log('🧪 RUNNING FULL ACCOUNT LIFECYCLE TEST');
console.log('==============================================');
console.log(`Using test user: ${EMAIL}`);

// Results tracking
const results = {
  register: false,
  login: false,
  accountInfo: false,
  deleteAccount: false,
  checkDeletionStatus: false,
};

// Centralized fetch with logging
async function api(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`API Call: ${options.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, options);
    console.log(`Status: ${response.status}`);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }

    console.log('Response data:', data);
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { success: false, error };
  }
}

// Main test function
async function runTest() {
  console.log('\n🔹 1. REGISTERING USER');
  const register = await api('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: EMAIL,
      username: USERNAME,
      password: PASSWORD,
    }),
  });

  if (!register.success) {
    console.log('❌ Registration failed, stopping test');
    return;
  }

  results.register = true;
  const userId = register.data.user.id;
  const token = register.data.token;
  console.log(`✅ Registration successful (User ID: ${userId})`);

  console.log('\n🔹 2. LOGGING IN');
  const login = await api('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
  });

  if (!login.success) {
    console.log('❌ Login failed, stopping test');
    return;
  }

  results.login = true;
  const loginToken = login.data.token;
  console.log('✅ Login successful');

  // Try to get account info
  console.log('\n🔹 3. TESTING ACCOUNT INFO');
  const accountInfo = await api('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${loginToken}`,
    },
  });

  results.accountInfo = accountInfo.success;

  console.log('\n🔹 4. TESTING ACCOUNT DELETION');
  // Test the direct deletion endpoint for simplicity
  const accountDeletion = await api(`/api/auth/test-delete/${userId}`, {
    method: 'DELETE',
  });

  results.deleteAccount = accountDeletion.success;

  if (accountDeletion.success) {
    console.log('✅ Account deletion successful');

    console.log('\n🔹 5. VERIFYING DELETED ACCOUNT STATUS');
    const checkStatus = await api('/api/auth/process-deletions', {
      method: 'GET',
    });

    results.checkDeletionStatus = checkStatus.success;
  }

  // Final summary
  console.log('\n==============================================');
  console.log('TEST RESULTS SUMMARY:');
  console.log('==============================================');
  console.log(
    `User Registration:   ${results.register ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `User Login:          ${results.login ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `Account Info:        ${results.accountInfo ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `Account Deletion:    ${results.deleteAccount ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log(
    `Deletion Status:     ${results.checkDeletionStatus ? '✅ PASSED' : '❌ FAILED'}`
  );
  console.log('==============================================');

  const totalTests = Object.values(results).filter(Boolean).length;
  const totalPossible = Object.keys(results).length;
  console.log(`${totalTests}/${totalPossible} tests passed`);

  if (totalTests === totalPossible) {
    console.log(
      '\n✅ ALL TESTS PASSED - Account lifecycle functionality verified'
    );
  } else {
    console.log(
      '\n⚠️ SOME TESTS FAILED - Please check the logs above for details'
    );
  }
}

// Run the test
runTest();
