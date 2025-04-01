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
const TEST_PAGE_URL = 'http://localhost:3001/dashboard'; // URL to test authenticated access

// Get credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

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
    
    // Step 2: Call the test-login endpoint with the access token
    console.log('2. Calling test-login endpoint with access token...');
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
    
    // In a real test runner (Playwright/Cypress), you would now:
    // 1. Set the cookie in the browser context
    // 2. Navigate to a protected page
    // 3. Verify the user is authenticated
    
    console.log(`\nTest completed successfully!`);
    console.log(`\nIn a real E2E test, you would now:`);
    console.log(`1. Set the session cookie in your browser context`);
    console.log(`2. Navigate to ${TEST_PAGE_URL}`);
    console.log(`3. Verify that you can access authenticated content`);
    
    return true;
  } catch (error) {
    console.error('\nTest failed:', error.message);
    return false;
  }
}

// Run the test
(async () => {
  const success = await testGoogleOAuthLogin();
  process.exit(success ? 0 : 1);
})();