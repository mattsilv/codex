# Local Google OAuth Testing Guide

This guide will help you set up and test Google OAuth authentication in your local development environment.

## Prerequisites

1. Google Cloud account
2. Local development environment set up
3. Backend and frontend running

## Step 1: Set Up Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

## Step 2: Create OAuth Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "OAuth client ID"
3. Set Application type to "Web application"
4. Add the following to "Authorized JavaScript Origins":
   ```
   http://localhost:3001
   http://localhost:8787
   ```
5. Add the following to "Authorized redirect URIs":
   ```
   http://localhost:8787/api/auth/callback/google
   ```
6. Click "Create" and note your Client ID and Client Secret

## Step 3: Obtain a Refresh Token

1. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (⚙️) in the top right
3. Check "Use your own OAuth credentials"
4. Enter your OAuth Client ID and Client Secret
5. Close the settings
6. In the left sidebar, select the following scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
7. Click "Authorize APIs"
8. Log in with a Google account you want to use for testing
9. After authorization, click "Exchange authorization code for tokens"
10. Note the Refresh Token from the response

## Step 4: Configure Local Environment

1. Create or update your `.dev.vars` file in the project root with the following values:

   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

   > ⚠️ **Important**: Make sure `.dev.vars` is in your `.gitignore` to avoid exposing secrets.

## Step 5: Run the OAuth Test

1. Ensure your backend server is running or let the test script start it for you
2. Run the test script:
   ```bash
   ./scripts/setup/setup-google-oauth-test.sh
   ```
3. The script will:
   - Verify your environment variables
   - Ensure the backend is running
   - Exchange the refresh token for an access token
   - Call the test login endpoint
   - Validate the authentication response

## Understanding the Test Flow

The test simulates the OAuth flow without requiring browser interaction:

1. **Token Exchange**: Uses the refresh token to get a new access token from Google
2. **Test Login**: Calls a special endpoint `/api/auth/google/test-login` with the access token
3. **Session Creation**: The backend verifies the token with Google, gets user info, and creates a session
4. **Cookie Setup**: The backend returns a session cookie that would normally be stored in the browser

In a real E2E test framework like Playwright or Cypress, you would then:

1. Set the session cookie in the browser context
2. Navigate to a protected page
3. Verify the authentication state

## Troubleshooting

### "Invalid Grant" Error

- Refresh tokens expire if unused for an extended period
- Solution: Repeat Step 3 to get a new refresh token

### "Not Authenticated" Error

- Check if your backend is properly configured for cookie authentication
- Verify the session cookie is being set correctly
- Check database connections and user table structure

### CORS Errors

- Ensure your backend CORS configuration allows credentials
- Check for proper headers in the response:
  ```
  Access-Control-Allow-Credentials: true
  Access-Control-Allow-Origin: http://localhost:3001
  ```

## Next Steps

- Integrate this test into your CI/CD pipeline
- Add more comprehensive E2E tests for different authentication scenarios
- Consider setting up test user accounts specifically for automated testing
