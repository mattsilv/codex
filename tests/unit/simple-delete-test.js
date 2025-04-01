// Minimalist test for user account deletion
// This script creates a user and then attempts to delete it directly

const EMAIL = `test_${Date.now()}@example.com`;
const USERNAME = `test_${Date.now()}`;
const PASSWORD = 'TestPassword123!';
const API_URL = 'http://localhost:8787';

// eslint-disable-next-line no-console
console.log('== SIMPLE USER DELETION TEST ==');
// eslint-disable-next-line no-console
console.log(`Test user: ${EMAIL}`);

// Step 1: Register a user
async function registerUser() {
  // eslint-disable-next-line no-console
  console.log('\n1. Creating test user...');

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('✅ User created successfully');
    // eslint-disable-next-line no-console
    console.log(`User ID: ${data.user.id}`);

    return data.user.id;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Registration error:', error.message);
    return null;
  }
}

// Step 2: Delete the user
async function deleteUser(userId) {
  // eslint-disable-next-line no-console
  console.log('\n2. Deleting test user...');
  // eslint-disable-next-line no-console
  console.log(`User ID to delete: ${userId}`);

  try {
    // Use the simplified test endpoint
    const response = await fetch(`${API_URL}/api/auth/test-delete/${userId}`, {
      method: 'DELETE',
    });

    // eslint-disable-next-line no-console
    console.log('Response status:', response.status);

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('Response data:', data);

    if (response.ok) {
      // eslint-disable-next-line no-console
      console.log('✅ User deleted successfully');
      return true;
    } else {
      // eslint-disable-next-line no-console
      console.error('❌ Deletion failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Deletion error:', error.message);
    return false;
  }
}

// Run the test
async function runTest() {
  // Step 1: Create a user
  const userId = await registerUser();
  if (!userId) {
    // eslint-disable-next-line no-console
    console.log('❌ Test failed: Could not create test user');
    return;
  }

  // Step 2: Delete the user
  const deletionSuccess = await deleteUser(userId);

  // Result
  // eslint-disable-next-line no-console
  console.log('\n== TEST RESULTS ==');
  if (deletionSuccess) {
    // eslint-disable-next-line no-console
    console.log('✅ TEST PASSED: User was successfully deleted');
  } else {
    // eslint-disable-next-line no-console
    console.log('❌ TEST FAILED: Could not delete user');
  }
}

runTest();
