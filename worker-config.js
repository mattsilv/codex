// This is a simplified worker configuration to bypass bundling issues
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      if (url.pathname === '/api/health') {
        const healthResponse = new Response(JSON.stringify({ 
          status: 'ok', 
          version: '1.0-dev',
          message: 'Using simplified worker for OAuth testing'
        }), {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        // Define addCorsHeaders function early for first endpoint use
        const addCorsHeaders = (response) => {
          // Clone the response to add headers
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3001');
          newHeaders.set('Access-Control-Allow-Credentials', 'true');
          newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        };
        
        return addCorsHeaders(healthResponse);
      }
      
      if (url.pathname === '/api/auth/google') {
        console.log('Google OAuth request - redirecting to mock consent screen');
        const state = crypto.randomUUID();
        const token = crypto.randomUUID();
        
        // The issue is here. In a normal OAuth flow, Google would return to our backend first, 
        // which would then redirect to the frontend. Since we're mocking this, we need to 
        // directly redirect to the frontend callback URL.
        const frontendUrl = 'http://localhost:3001';
        
        // Create a user object to simulate a successful OAuth login
        const user = {
          id: "google-oauth2|"+Date.now(),
          email: "oauth.test@example.com",
          username: "OAuth Tester",
          emailVerified: true
        };
        
        // Encode the user data for URL safety
        const encodedUser = encodeURIComponent(JSON.stringify(user));
        
        // Create the frontend callback URL that matches the format expected by AuthCallback.tsx
        const mockCallbackUrl = `${frontendUrl}/auth/callback?token=${token}&user=${encodedUser}`;
        
        console.log('Mock OAuth - generated token:', token);
        console.log('Mock OAuth - generated user:', user);
        console.log('Returning mock redirect URL:', mockCallbackUrl);
        
        // Create the response and add CORS headers
        const googleAuthResponse = new Response(JSON.stringify({ 
          url: mockCallbackUrl,
          state
        }), {
          headers: { 
            'Content-Type': 'application/json'
          }
        });
        
        // Add CORS headers
        const addCorsHeaders = (response) => {
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3001');
          newHeaders.set('Access-Control-Allow-Credentials', 'true');
          newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        };
        
        return addCorsHeaders(googleAuthResponse);
      }
      
      if (url.pathname === '/api/auth/login') {
        // Basic login endpoint for testing
        try {
          const { email, password } = await request.json();
          
          // Simple credential validation for testing
          if (email === 'alice@example.com' && password === 'password123') {
            return new Response(JSON.stringify({
              success: true,
              data: {
                token: "dev-session-token-" + Date.now(),
                user: {
                  id: "user-1",
                  email: "alice@example.com",
                  username: "Alice",
                  emailVerified: true
                }
              }
            }), {
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          
          return new Response(JSON.stringify({
            success: false,
            error: {
              code: "INVALID_CREDENTIALS",
              message: "Invalid email or password"
            }
          }), {
            status: 401,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (error) {
          console.error('Login error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Failed to process login"
            }
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }
      
      if (url.pathname === '/api/auth/google/test-login' && request.method === 'POST') {
        console.log('[Auth Router] Handling Google test login');
        try {
          const body = await request.json();
          const { access_token } = body;
          
          if (!access_token) {
            return new Response(JSON.stringify({
              success: false,
              error: {
                code: "INVALID_INPUT",
                message: "Access token is required"
              }
            }), {
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': 'http://localhost:3001',
                'Access-Control-Allow-Credentials': 'true'
              }
            });
          }
          
          console.log('[OAuth Test] Using provided access token');
          
          // In a simplified test environment, we don't actually validate with Google
          // Instead, we'll simulate a successful authentication
          const userId = 'google-oauth-test-' + Date.now();
          const sessionId = 'test-session-' + Date.now();
          
          // Create a session cookie for the browser
          const sessionCookie = `auth_session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Secure`;
          
          // Return user data and session information
          return new Response(
            JSON.stringify({
              success: true,
              sessionId: sessionId,
              user: {
                id: userId,
                email: "test@example.com",
                username: "Test User",
                emailVerified: true
              }
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': sessionCookie,
                'Access-Control-Allow-Origin': 'http://localhost:3001',
                'Access-Control-Allow-Credentials': 'true'
              }
            }
          );
        } catch (error) {
          console.error('[OAuth Test] Test login error:', error);
          return new Response(JSON.stringify({
            success: false,
            error: {
              code: "TEST_LOGIN_FAILED",
              message: "Failed to execute test login"
            }
          }), {
            status: 500,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:3001',
              'Access-Control-Allow-Credentials': 'true'
            }
          });
        }
      }
      
      // CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3001',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        });
      }
      
      // Helper function to add CORS headers to all responses
      const addCorsHeaders = (response) => {
        // Clone the response to add headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3001');
        newHeaders.set('Access-Control-Allow-Credentials', 'true');
        newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      };
      
      // Default - not found
      const notFoundResponse = new Response(JSON.stringify({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Endpoint not found in simplified worker"
        }
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      return addCorsHeaders(notFoundResponse);
      
    } catch (error) {
      console.error('Worker error:', error);
      const errorResponse = new Response(JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Simplified worker encountered an error"
        }
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      
      // Add CORS headers to error response
      const newHeaders = new Headers(errorResponse.headers);
      newHeaders.set('Access-Control-Allow-Origin', 'http://localhost:3001');
      newHeaders.set('Access-Control-Allow-Credentials', 'true');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return new Response(errorResponse.body, {
        status: errorResponse.status,
        statusText: errorResponse.statusText,
        headers: newHeaders
      });
    }
  }
};