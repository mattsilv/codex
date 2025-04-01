/**
 * Lucia Auth API handlers
 * Implements authentication endpoints using Lucia
 */
import { initializeLucia, initializeGoogleProvider, formatUserResponse, extractSessionToken } from '../utils/auth.ts';
import { createSuccessResponse, createErrorResponse } from '../middleware/cors.ts';

/**
 * Handle registration via username/password
 */
export async function handleRegistration(request: Request, env: any): Promise<Response> {
  const auth = initializeLucia(env);
  
  try {
    const body = await request.json();
    const { email, username, password } = body;
    
    // Input validation
    if (!email || !username || !password) {
      return createErrorResponse(
        request, 
        400, 
        'INVALID_INPUT', 
        'Email, username and password are required', 
        null, 
        env
      );
    }
    
    // Check if user already exists
    let existingUser;
    try {
      // Custom query to check existing user
      const stmt = env.DB.prepare(
        "SELECT id FROM users WHERE email = ?"
      ).bind(email);
      const result = await stmt.first();
      existingUser = result;
    } catch (error) {
      console.error('Database error checking existing user:', error);
    }
    
    if (existingUser) {
      return createErrorResponse(
        request, 
        409, 
        'USER_EXISTS', 
        'A user with this email already exists', 
        null, 
        env
      );
    }
    
    // Create a new user with Lucia
    const userId = crypto.randomUUID();
    
    // Insert the user
    await env.DB.prepare(
      "INSERT INTO users (id, email, username, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(
      userId,
      email,
      username,
      false,
      Date.now(),
      Date.now()
    ).run();
    
    // Create a password key for the user
    await auth.createKey({
      userId: userId,
      providerId: "email",
      providerUserId: email,
      password
    });
    
    // Create session
    const session = await auth.createSession({
      userId: userId,
      attributes: {}
    });
    
    const sessionToken = session.id;
    
    const user = {
      id: userId,
      email,
      username,
      emailVerified: false
    };
    
    return createSuccessResponse(
      request,
      { token: sessionToken, user },
      201,
      env
    );
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse(
      request,
      500,
      'REGISTRATION_FAILED',
      'Failed to create account',
      null,
      env
    );
  }
}

/**
 * Handle login via username/password
 */
export async function handleLogin(request: Request, env: any): Promise<Response> {
  const auth = initializeLucia(env);
  
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // Input validation
    if (!email || !password) {
      return createErrorResponse(
        request,
        400,
        'INVALID_INPUT',
        'Email and password are required',
        null,
        env
      );
    }
    
    // Find key using email
    const key = await auth.useKey("email", email, password);
    const user = await auth.getUser(key.userId);
    
    // Create session
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {}
    });
    
    // Format user response to match our existing format
    const userResponse = formatUserResponse(user);
    
    return createSuccessResponse(
      request,
      { 
        token: session.id, 
        user: userResponse
      },
      200,
      env
    );
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle specific Lucia errors
    if (error.message === 'AUTH_INVALID_KEY_ID' || 
        error.message === 'AUTH_INVALID_PASSWORD') {
      return createErrorResponse(
        request,
        401,
        'INVALID_CREDENTIALS',
        'Invalid email or password',
        null,
        env
      );
    }
    
    return createErrorResponse(
      request,
      500,
      'LOGIN_FAILED',
      'An error occurred during login',
      null,
      env
    );
  }
}

/**
 * Handle user logout
 */
export async function handleLogout(request: Request, env: any): Promise<Response> {
  const auth = initializeLucia(env);
  const sessionHandler = auth.handleRequest(request.method, {
    request: request.url,
    headers: request.headers,
  });

  try {
    // Validate session from cookie/header
    const session = await sessionHandler.validate(); 

    if (!session) {
      // No active session, maybe already logged out or cookie expired
      return createSuccessResponse(request, { message: 'Already logged out' }, 200, env);
    }

    // Invalidate the session in the database
    await auth.invalidateSession(session.sessionId);

    // Create a blank cookie to clear the browser's session cookie
    const blankCookie = auth.createBlankSessionCookie();

    console.log('User logged out, invalidating session:', session.sessionId);

    // Respond with success and clear cookie header
    return new Response(null, {
      status: 200, 
      headers: {
        'Set-Cookie': blankCookie.serialize(),
        'Content-Type': 'application/json' // Ensure correct content type for potential empty body
      },
      // Sending an empty body or a simple success message
      // body: JSON.stringify({ message: 'Logout successful' }) 
    });

  } catch (error) {
    console.error('Logout error:', error);
    // Create a blank cookie even on error to attempt clearing the client state
    const blankCookie = auth.createBlankSessionCookie();
    return createErrorResponse(
      request,
      500,
      'LOGOUT_FAILED',
      'Failed to logout',
      null,
      env,
      { 'Set-Cookie': blankCookie.serialize() } // Add clear cookie header to error response
    );
  }
}

/**
 * Initialize Google OAuth login
 */
export async function handleGoogleAuth(request: Request, env: any): Promise<Response> {
  // Don't proceed if Google OAuth is not configured
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return createErrorResponse(
      request,
      501,
      'NOT_IMPLEMENTED',
      'Google authentication is not configured',
      null,
      env
    );
  }
  
  const auth = initializeLucia(env);
  const googleAuth = initializeGoogleProvider(auth, env);
  
  if (!googleAuth) {
    return createErrorResponse(
      request,
      500,
      'PROVIDER_ERROR',
      'Failed to initialize Google provider',
      null,
      env
    );
  }
  
  // Generate OAuth URL 
  const [url, state] = await googleAuth.getAuthorizationUrl();
  
  // Store state for CSRF verification
  // In a real implementation, you'd store this in a KV or similar
  
  // Respond with the authorization URL
  return createSuccessResponse(
    request,
    { url, state },
    200,
    env
  );
}

/**
 * Handle Google OAuth callback
 */
export async function handleGoogleCallback(request: Request, env: any): Promise<Response> {
  // Don't proceed if Google OAuth is not configured
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return createErrorResponse(
      request,
      501,
      'NOT_IMPLEMENTED',
      'Google authentication is not configured',
      null,
      env
    );
  }
  
  console.log('[OAuth] Handling Google callback');
  
  const auth = initializeLucia(env);
  const googleAuth = initializeGoogleProvider(auth, env);
  
  // Retrieve session handler for cookie management
  const sessionHandler = auth.handleRequest(request.method, {
    request: request.url,
    headers: request.headers,
  });
  
  if (!googleAuth) {
    return createErrorResponse(
      request,
      500,
      'PROVIDER_ERROR',
      'Failed to initialize Google provider',
      null,
      env
    );
  }
  
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  console.log(`[OAuth] Callback params - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}`);
  
  // Validate required params
  if (!code || !state) {
    return createErrorResponse(
      request,
      400,
      'INVALID_CALLBACK',
      'Invalid OAuth callback parameters',
      null,
      env
    );
  }
  
  try {
    // Validate the callback
    console.log('[OAuth] Validating callback with Google provider');
    const { getExistingUser, googleUser, createUser } = await googleAuth.validateCallback(code);
    
    console.log(`[OAuth] Google user data: ${googleUser.email}, ${googleUser.name}`);
    
    // Check if user exists
    const existingUser = await getExistingUser();
    let user;
    
    if (existingUser) {
      console.log(`[OAuth] Existing user found: ${existingUser.id}`);
      // User exists, create a new session
      user = existingUser;
    } else {
      console.log('[OAuth] Creating new user from Google data');
      // Create a new user with Google data
      const username = googleUser.name || googleUser.email.split('@')[0];
      
      user = await createUser({
        attributes: {
          email: googleUser.email,
          username: username,
          emailVerified: true, // Google-authenticated users are considered verified
          created_at: new Date().toISOString(), // Match existing schema
          updated_at: new Date().toISOString(),
          oauth_provider: 'google',
          oauth_id: googleUser.sub
        }
      });
    }
    
    // Create a new session
    console.log(`[OAuth] Creating session for user: ${user.id}`);
    const session = await auth.createSession({
      userId: user.id,
      attributes: {}
    });
    
    // Create session cookie
    const sessionCookie = auth.createSessionCookie(session.id);
    
    // Format user data (optional, might not be needed if frontend fetches on load)
    // const userResponse = formatUserResponse(user); 
    
    // Determine frontend URL for redirect
    const frontendUrl = env.ENVIRONMENT === 'production' 
      ? 'https://codex.silv.app' 
      : 'http://localhost:3001';
    
    // Redirect directly to dashboard, setting the session cookie
    const redirectUrl = `${frontendUrl}/dashboard`; 
    console.log(`[OAuth] Redirecting to frontend dashboard: ${redirectUrl} and setting session cookie`);
    
    // Redirect to frontend with session cookie
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        // Set the session cookie
        'Set-Cookie': sessionCookie.serialize() 
      }
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return createErrorResponse(
      request,
      500,
      'OAUTH_ERROR',
      'Failed to authenticate with Google',
      null,
      env
    );
  }
}

/**
 * Get current authenticated user
 */
export async function handleGetCurrentUser(request: Request, env: any): Promise<Response> {
  try {
    // User should already be attached to request by authenticateRequest middleware
    const user = (request as any).user;
    
    if (!user) {
      return createErrorResponse(
        request,
        401,
        'UNAUTHORIZED',
        'Not authenticated',
        null,
        env
      );
    }
    
    return createSuccessResponse(
      request,
      formatUserResponse(user),
      200,
      env
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return createErrorResponse(
      request,
      500,
      'USER_FETCH_ERROR',
      'Failed to get user data',
      null,
      env
    );
  }
}

/**
 * Handle Google OAuth test login for automated testing
 * This endpoint accepts an access token directly and creates a session
 */
export async function handleGoogleTestLogin(request: Request, env: any): Promise<Response> {
  // Don't proceed if Google OAuth is not configured
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return createErrorResponse(
      request,
      501,
      'NOT_IMPLEMENTED',
      'Google authentication is not configured',
      null,
      env
    );
  }
  
  try {
    const auth = initializeLucia(env);
    const body = await request.json();
    const { access_token } = body;
    
    if (!access_token) {
      return createErrorResponse(
        request,
        400,
        'INVALID_INPUT',
        'Access token is required',
        null,
        env
      );
    }
    
    console.log('[OAuth Test] Using provided access token to fetch user info');
    
    // Fetch user info from Google using the access token
    const googleUserInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );
    
    if (!googleUserInfoResponse.ok) {
      return createErrorResponse(
        request,
        401,
        'INVALID_TOKEN',
        'Invalid or expired Google access token',
        null,
        env
      );
    }
    
    const googleUser = await googleUserInfoResponse.json();
    console.log('[OAuth Test] Google user data retrieved:', googleUser.email);
    
    // Check if user exists in our database
    const existingUserQuery = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    ).bind(googleUser.email).first();
    
    let userId;
    
    if (existingUserQuery) {
      console.log('[OAuth Test] Existing user found:', existingUserQuery.id);
      userId = existingUserQuery.id;
    } else {
      console.log('[OAuth Test] Creating new user from Google data');
      // Create a new user with Google data
      userId = crypto.randomUUID();
      const username = googleUser.name || googleUser.email.split('@')[0];
      
      await env.DB.prepare(
        "INSERT INTO users (id, email, username, emailVerified, createdAt, updatedAt, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      ).bind(
        userId,
        googleUser.email,
        username,
        true, // Google-authenticated users are considered verified
        Date.now(),
        Date.now(),
        'google',
        googleUser.id // Google's user ID
      ).run();
    }
    
    // Create a new session for the user
    const session = await auth.createSession({
      userId: userId,
      attributes: {}
    });
    
    // Create a session cookie for the browser
    const sessionCookie = auth.createSessionCookie(session.id);
    
    // Return user data and session information
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        user: {
          id: userId,
          email: googleUser.email,
          username: googleUser.name || googleUser.email.split('@')[0],
          emailVerified: true
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': sessionCookie.serialize()
        }
      }
    );
  } catch (error) {
    console.error('[OAuth Test] Test login error:', error);
    return createErrorResponse(
      request,
      500,
      'TEST_LOGIN_FAILED',
      'Failed to execute test login',
      null,
      env
    );
  }
}

/**
 * Main router for auth endpoints
 */
export async function handleAuthRequest(
  request: Request,
  env: any,
  ctx: any
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`[Auth Router] Processing request for path: ${path}, method: ${request.method}`);
  
  // Route to appropriate handler based on path
  if (path === '/api/auth/register' && request.method === 'POST') {
    return handleRegistration(request, env);
  } else if (path === '/api/auth/login' && request.method === 'POST') {
    return handleLogin(request, env);
  } else if (path === '/api/auth/logout' && request.method === 'POST') {
    return handleLogout(request, env);
  } else if (path === '/api/auth/google' && request.method === 'GET') {
    console.log('[Auth Router] Handling Google auth initialization');
    return handleGoogleAuth(request, env);
  } else if (path === '/api/auth/callback/google' && request.method === 'GET') {
    console.log('[Auth Router] Handling Google auth callback');
    return handleGoogleCallback(request, env);
  } else if (path === '/api/auth/me' && request.method === 'GET') {
    return handleGetCurrentUser(request, env);
  } else if (path === '/api/auth/google/test-login' && request.method === 'POST') {
    console.log('[Auth Router] Handling Google test login');
    return handleGoogleTestLogin(request, env);
  }
  
  // Handle other auth endpoints or return 404
  return createErrorResponse(
    request,
    404,
    'NOT_FOUND',
    'Auth endpoint not found',
    null,
    env
  );
}