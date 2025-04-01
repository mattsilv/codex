# Google OAuth Setup Guide

## Overview

This document provides detailed instructions for setting up Google OAuth for the Codex application. This enables users to log in with their Google accounts instead of creating separate credentials for your application.

## Prerequisites

Before starting the OAuth configuration:

1. You need a Google Cloud account
2. Access to the Google Cloud Console (https://console.cloud.google.com/)
3. Your application must be deployed or running locally

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top of the page
3. Click "NEW PROJECT" in the window that appears
4. Enter a project name (e.g., "Codex Application")
5. Choose an organization (optional)
6. Click "CREATE"
7. Wait for the project to be created, then select it

## Step 2: Configure the OAuth Consent Screen

1. In the Google Cloud Console menu, navigate to "APIs & Services" > "OAuth consent screen"
2. Select the appropriate user type:
   - **External**: For testing or applications available to any Google user (requires verification for production)
   - **Internal**: For applications only available to users within your organization
3. Click "CREATE"
4. Fill in the required fields:
   - **App name**: "Codex"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click "SAVE AND CONTINUE"
6. On the "Scopes" page, add the following scopes:
   - `./auth/userinfo.email`
   - `./auth/userinfo.profile`
   - `openid`
7. Click "SAVE AND CONTINUE"
8. Add test users if necessary (for External user type in testing)
9. Review the information and click "BACK TO DASHBOARD"

## Step 3: Create OAuth Client ID

1. In the Google Cloud Console menu, navigate to "APIs & Services" > "Credentials"
2. Click "CREATE CREDENTIALS" and select "OAuth client ID"
3. For "Application type", select "Web application"
4. Name: "Codex Web Client"
5. Configure the authorized JavaScript origins:

   **Development:**
   ```
   http://localhost:5173
   http://localhost:3001
   http://localhost:8787
   ```

   **Production:**
   ```
   https://your-production-domain.com
   ```

6. Configure the authorized redirect URIs:

   **Development:**
   ```
   http://localhost:8787/api/auth/callback/google
   ```

   **Production:**
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```

> **CRITICAL:** These specific port numbers (5173, 3001, 8787) MUST be listed in your Google OAuth configuration AND match your local development setup:
> - Port **3001** is the primary frontend port (configured in vite.config.js)
> - Port **5173** is included as an alternative frontend port (Vite default)
> - Port **8787** is the backend port (Wrangler default)
>
> If the frontend or backend runs on different ports, authentication will fail with misleading error messages.
> **DO NOT CHANGE THESE PORTS** without updating both the OAuth console configuration and all relevant code references.

7. Click "CREATE"
8. A modal will display your **Client ID** and **Client Secret**. Save these values securely.

## Step 4: Update Wrangler Configuration

1. Create a `wrangler.toml` file in your project root (if not already present) based on `wrangler.example.toml`
2. Add your Google OAuth credentials:

```toml
# Development settings
[vars]
ENVIRONMENT = "development"
JWT_SECRET = "your-secure-jwt-secret"
# Google OAuth configuration
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"

# Production environment
[env.production]
vars = { 
  ENVIRONMENT = "production",
  JWT_SECRET = "your-production-jwt-secret",
  GOOGLE_CLIENT_ID = "your-production-google-client-id",
  GOOGLE_CLIENT_SECRET = "your-production-google-client-secret"
}
```

## Step 5: Configure the Redirect Handling in Code

Ensure your backend and frontend properly handle the OAuth flow:

1. Backend (`src/backend/api/auth.ts`):
   - Must have the `/api/auth/google` endpoint for initiating the flow
   - Must have the `/api/auth/callback/google` endpoint for handling redirects

2. Frontend (`src/frontend/components/auth/GoogleLoginButton.tsx`):
   - Triggers the redirect to `/api/auth/google` when clicked
   - Properly uses the AuthContext to handle the subsequent login flow

## Security Considerations

1. **Credentials Protection**:
   - Never commit your `GOOGLE_CLIENT_SECRET` to version control
   - Use environment variables in production
   - Restrict the OAuth client's usage to your application's domains

2. **Scopes and Permissions**:
   - Request only the minimal permissions needed (email, profile)
   - Privacy policy and terms of service are required for verification if you plan to publish your app

3. **Token Handling**:
   - Use secure storage mechanisms for tokens
   - Always validate tokens on the backend

## Testing

1. Test the Google OAuth flow by clicking the "Continue with Google" button in your application
2. Verify the login endpoint works with test Google accounts
3. Confirm the redirect correctly returns to your application
4. Check that user data is properly saved in your database

## Troubleshooting

### Common OAuth Errors

1. **"Error 400: redirect_uri_mismatch"**
   - The redirect URI in your request doesn't match any of the URIs authorized in Google Cloud Console
   - Solution: Double-check the redirect URI in your code matches exactly what's in Google Cloud Console

2. **"Error 401: invalid_client"**
   - Client ID or client secret is incorrect
   - Solution: Verify credentials in wrangler.toml match those in Google Cloud Console

3. **"Error: idpiframe_initialization_failed"**
   - Usually a domain mismatch or CORS issue
   - Solution: Ensure JavaScript origins are correctly set in Google Cloud Console

4. **Cookies/Storage Issues**
   - Check browser console for cookie or localStorage errors
   - Solution: Ensure your site uses HTTPS in production for secure cookie storage

### Lucia-Specific Debugging

If you encounter issues with the Lucia auth implementation:

1. Check the Lucia logs in your backend console
2. Verify the OAuth provider setup in `src/backend/utils/auth.ts`
3. Ensure database tables are correctly set up for Lucia

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Lucia Auth Documentation](https://lucia-auth.com/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)