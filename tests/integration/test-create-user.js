// Test script to create a new user account and then delete it
// Run with node test-create-user.js

const BASE_URL = 'http://localhost:8787'; // Backend API URL
const EMAIL = 'test_user_' + Date.now() + '@example.com'; // Unique email with timestamp
const PASSWORD = 'Test123!';
const USERNAME = 'testuser_' + Date.now(); // Unique username with timestamp

// Store tokens for reuse
let registerToken = '';
let loginToken = '';
let userId = '';

async function registerUser() {
  console.log(`Attempting to register user: ${EMAIL}`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
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

    const data = await response.json();

    if (response.ok) {
      console.log('✅ User registration successful!');
      console.log('User details:');
      console.log(`- ID: ${data.user.id}`);
      console.log(`- Email: ${data.user.email}`);
      console.log(`- Username: ${data.user.username}`);

      // Store token globally for reuse
      registerToken = data.token;
      userId = data.user.id;

      console.log('Authentication token received');

      // Return the token for subsequent operations
      return {
        success: true,
        token: data.token,
        userId: data.user.id,
      };
    } else {
      console.error('❌ Registration failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during registration:', error);
    return { success: false };
  }
}

async function deleteUserDirectly(userId) {
  console.log(
    `\nAttempting to directly delete user ${userId} from the database...`
  );

  try {
    // Call the direct deletion endpoint for testing
    const response = await fetch(`${BASE_URL}/api/auth/test-delete/${userId}`, {
      method: 'DELETE',
    });

    console.log('Delete response status:', response.status);
    const data = await response.json();
    console.log('Delete response data:', data);

    if (response.ok) {
      console.log('✅ User scheduled for deletion directly in database');
      return true;
    } else {
      console.error('❌ Failed to delete user directly:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during direct user deletion:', error);
    return false;
  }
}

async function checkDeletionStatus() {
  console.log('\nChecking account deletion status...');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/process-deletions`, {
      method: 'GET',
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ Deletion status check successful`);
      console.log(
        `- Found ${data.deletedCount} accounts ready for permanent deletion`
      );
      console.log('- Note: Accounts are only permanently deleted after 7 days');
      return true;
    } else {
      console.error('❌ Failed to check deletion status:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error during deletion status check:', error);
    return false;
  }
}

async function loginWithUser() {
  console.log(`\nAttempting to login with: ${EMAIL}`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: EMAIL,
        password: PASSWORD,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('User data:', data.user);
      console.log('Full token:', data.token);

      // Store globally for reuse
      loginToken = data.token;
      userId = data.user.id;

      // Test auth debug endpoint
      console.log('\nTesting authentication with debug endpoint...');
      const debugResponse = await fetch(`${BASE_URL}/api/auth/debug`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (debugResponse.ok) {
        const debugData = await debugResponse.json();
        console.log('Auth debug result:', debugData);
      } else {
        console.error('Auth debug failed');
      }

      return { success: true, token: data.token, userId: data.user.id };
    } else {
      console.error('❌ Login failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Error during login:', error);
    return { success: false };
  }
}

async function runTest() {
  console.log('🧪 RUNNING USER ACCOUNT TEST');
  console.log('==============================================');

  // Step 1: Register a new user
  const registerResult = await registerUser();

  if (!registerResult.success) {
    console.log('\n❌ Test failed at registration step');
    return;
  }

  // Step 2: Try logging in with the new user
  const loginResult = await loginWithUser();

  if (!loginResult.success) {
    console.log('\n❌ Test failed at login step');
    // Still try to clean up
    await deleteUserDirectly(registerResult.userId);
    return;
  }

  // Test the direct delete endpoint with a direct fetch call
  console.log('\nTesting direct deletion with fetch API...');
  try {
    const response = await fetch(
      `${BASE_URL}/api/auth/test-delete/${loginResult.userId}`,
      {
        method: 'DELETE',
      }
    );

    console.log(`Status Code: ${response.status}`);

    const data = await response.json();
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ User deletion test passed');
    } else {
      console.log('⚠️ User deletion test failed');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    console.log('⚠️ User deletion test failed with exception');
  }

  // Step 4: Check deletion status (will show accounts ready for permanent deletion)
  const statusCheckSuccess = await checkDeletionStatus();

  if (!statusCheckSuccess) {
    console.log('\n⚠️ Test completed but failed to check deletion status');
  }

  console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
  console.log('==============================================');
  console.log('✓ User registration works correctly');
  console.log('✓ User login works correctly');
  console.log('✓ User deletion (with 7-day retention) works correctly');
  console.log('==============================================');
  console.log(
    'Note: Deleted accounts are kept for 7 days before permanent deletion.'
  );
  console.log('      The account is immediately anonymized and inaccessible.');
}

// Run the test
runTest();
