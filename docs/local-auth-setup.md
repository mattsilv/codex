Thanks for the update and for making those improvements! Consolidating the authentication logic around `AuthContext` and Lucia's cookie-based approach is a great step.

Based on your summary of changes, the core strategy for testing Google OAuth locally using a refresh token remains the same, but we can refine the instructions, especially regarding the verification step in the E2E test.

Here are the updated instructions for your engineer:

**Goal:** Implement an automated E2E test for the Google OAuth login flow using a pre-obtained refresh token, leveraging the updated `AuthContext`-based system.

**I. Manual Steps (To be performed by the Engineer):**

_(These steps remain unchanged)_

1.  **Google Cloud Setup:**
    - Ensure you have a Google Cloud project with OAuth 2.0 credentials set up.
    - Verify that `http://localhost` (and the relevant port, e.g., `http://localhost:5173`) is in "Authorized JavaScript origins".
    - Verify that a suitable redirect URI (e.g., `http://localhost:8788/api/auth/google/callback`) is in "Authorized redirect URIs".
2.  **Obtain Refresh Token:**
    - Use the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground) with your `Client ID` and `Client Secret` (Server-side flow, Offline access).
    - Authorize `profile` and `email` scopes.
    - Exchange the authorization code for tokens.
    - **Securely store the `Refresh token`**. Use a dedicated Google test account.
3.  **Configure Environment Variables:**
    - Add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REFRESH_TOKEN` to your `.dev.vars` file (ensure it's gitignored).

**II. Coding Tasks (Engineer + AI Assistant):**

1.  **Backend Modification:**

    - **File:** `src/backend/api/auth.ts`
    - **Action:** Create a new exported async function, `handleGoogleTestLogin`.
    - **Purpose:** Handle logins specifically for automated tests, bypassing the UI flow.
    - **Logic:**
      - Accepts a `POST` request with a Google `access_token` in the JSON body.
      - Uses the `access_token` to fetch the user's profile from Google's userinfo endpoint (`https://www.googleapis.com/oauth2/v1/userinfo`).
      - Extracts Google User ID (`sub`) and email.
      - Looks up or creates the user in your database based on Google ID/email (similar logic to your existing Google callback handler, ensuring integration with Lucia).
      - Initializes Lucia (`initializeLucia(env)`).
      - Creates an application session for the user (`auth.createSession`).
      - Returns a success response containing the **application session ID** (e.g., `session.id`) and user details. Handles errors.
    - **File:** `src/backend/router.ts` (or `worker.ts` if routes are there)
    - **Action:** Add a route mapping `POST /api/auth/google/test-login` to `handleGoogleTestLogin`.

2.  **Automated Test Implementation:**
    - **File:** `tests/e2e/auth.spec.ts` (or create `tests/e2e/google-auth.spec.ts`). Adapt for your specific test runner (Playwright/Cypress).
    - **Action:** Add a new test case (e.g., `it('should log in via Google using refresh token', async () => { ... });`).
    - **Purpose:** Simulate Google login programmatically.
    - **Logic:**
      - Read `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` from environment variables.
      - `POST` to Google's token endpoint (`https://www.googleapis.com/oauth2/v4/token`) with `client_id`, `client_secret`, `refresh_token`, and `grant_type: 'refresh_token'`.
      - Extract the `access_token` from Google's response.
      - `POST` to your new backend endpoint (`/api/auth/google/test-login`) with the JSON body `{ "access_token": "..." }`.
      - Extract the **application session ID** from your backend's response.
      - **Verification (Leveraging Cookie Auth):**
        - Use your test runner's capabilities to **manually set a cookie** in the browser context before navigating or making further requests.
        - **Cookie Name:** `auth_session` (This is Lucia's default, verify if you've customized it).
        - **Cookie Value:** The application session ID received from `/api/auth/google/test-login`.
        - **Cookie Domain/Path:** Set appropriately for your local setup (e.g., domain `localhost`, path `/`).
        - Navigate to a protected page within your application.
        - Assert that the user is successfully logged in. This could involve:
          - Checking that the `AuthContext` reflects an authenticated state (if your test runner allows inspecting client-side context/state).
          - Verifying that UI elements specific to logged-in users are present.
          - Making a subsequent request to a protected API endpoint using the test runner's browser context (which now includes the `auth_session` cookie) and asserting a successful response.

This updated approach ensures the test aligns with your cookie-based authentication flow managed by `AuthContext`. The key is setting the `auth_session` cookie directly in the test after obtaining the session ID from the dedicated test login endpoint.
