/**
 * OAuth Login Test Script
 * 
 * This script tests the Google OAuth login flow using a refresh token.
 * It follows the approach described in /docs/local-auth-setup.md
 */

// Force strict mode
'use strict';

// Import required modules
import fetch from 'node-fetch';

// Constants
const API_URL = process.env.API_URL || 'http://localhost:8787';
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v1/userinfo';
const TEST_PAGE_URL = 'http://localhost:3001/dashboard'; // URL to test authenticated access

// Get credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

// The test email address to verify
const EXPECTED_EMAIL = process.env.EXPECTED_EMAIL || 'mattgpt30@gmail.com';

// Verify required environment variables are set
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
  console.error('Error: Missing required environment variables.');
  console.error('Please ensure the following variables are set:');
  console.error('  - GOOGLE_CLIENT_ID');
  console.error('  - GOOGLE_CLIENT_SECRET');
  console.error('  - GOOGLE_REFRESH_TOKEN');
  console.error('\nRefer to /docs/local-auth-setup.md for setup instructions.');
  process.exit(1);
}

/**
 * Test the Google OAuth login flow with a refresh token
 */
async function testGoogleOAuthLogin() {
  console.log('Starting Google OAuth login test...');
  
  try {
    // Step 1: Exchange refresh token for an access token
    console.log('1. Exchanging refresh token for access token...');
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: GOOGLE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    });
    
    if (!tokenResponse.ok) {
      console.error('Error fetching access token:');
      console.error(await tokenResponse.text());
      throw new Error('Failed to get access token from Google');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Access token obtained successfully!');
    
    // Step 2: Verify the token works by calling Google's user info endpoint
    console.log('2. Verifying token with Google User Info API...');
    const userInfoResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userInfoResponse.ok) {
      console.error('Error fetching user info:');
      console.error(await userInfoResponse.text());
      throw new Error('Failed to get user info from Google');
    }
    
    const userData = await userInfoResponse.json();
    console.log(`Google user info retrieved successfully for: ${userData.email}`);
    
    if (userData.email !== EXPECTED_EMAIL) {
      console.warn(`Warning: The OAuth token is for ${userData.email}, not for the expected ${EXPECTED_EMAIL}`);
    }
    
    // Step 3: Call the test-login endpoint with the access token
    console.log('3. Calling test-login endpoint with access token...');
    const loginResponse = await fetch(`${API_URL}/api/auth/google/test-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: tokenData.access_token
      })
    });
    
    if (!loginResponse.ok) {
      console.error('Error with test login:');
      console.error(await loginResponse.text());
      throw new Error('Failed to authenticate with test-login endpoint');
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful!');
    console.log('User details:', loginData.user);
    console.log('Session ID:', loginData.sessionId);
    
    // Extract session cookie from the response headers
    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      throw new Error('No session cookie returned from the server');
    }
    
    console.log('Session cookie received!');
    
    // Step 4: Use the session cookie to make an authenticated request
    const sessionCookie = cookies.split(';')[0]; // Extract just the name=value part
    console.log('4. Testing authenticated access with session cookie...');
    
    const authCheckResponse = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': sessionCookie
      }
    });
    
    if (!authCheckResponse.ok) {
      console.error('Error with authenticated request:');
      console.error(await authCheckResponse.text());
      throw new Error('Failed to access protected endpoint with session cookie');
    }
    
    const authCheckData = await authCheckResponse.json();
    console.log('Protected endpoint access successful!');
    console.log('Authenticated user:', authCheckData);
    
    console.log(`\nTest completed successfully!`);
    console.log(`\nVerified that OAuth login works for email: ${userData.email}`);
    
    return { success: true, email: userData.email };
  } catch (error) {
    console.error('\nTest failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
(async () => {
  const result = await testGoogleOAuthLogin();
  
  if (result.success) {
    console.log('\n✅ Google OAuth test passed successfully');
    console.log(`Authenticated with email: ${result.email}`);
    process.exit(0);
  } else {
    console.error('\n❌ Google OAuth test failed');
    console.error('Error:', result.error);
    process.exit(1);
  }
})();