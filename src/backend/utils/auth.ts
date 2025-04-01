/**
 * Authentication using Lucia Auth
 * Cloudflare Workers compatible implementation
 */
import { lucia } from 'lucia';
import { d1 } from '@lucia-auth/adapter-sqlite';
// Temporarily comment out OAuth import to get the backend running
// import { google } from '@lucia-auth/oauth/providers';

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified?: boolean;
}

/**
 * Initialize Lucia Auth
 * 
 * @param env Environment containing secrets and bindings
 * @returns Lucia auth instance
 */
export function initializeLucia(env: any) {
  // Create the auth instance with D1 adapter
  const auth = lucia({
    // Use D1 database for storage
    adapter: d1(env.DB, {
      // Table definitions - matches our existing schema
      user: 'users',
      session: 'sessions',
      key: 'auth_keys'
    }),
    env: 'DEV', // Use 'PROD' for production
    getUserAttributes: (data) => {
      return {
        username: data.username,
        email: data.email,
        emailVerified: Boolean(data.emailVerified)
      };
    }
  });

  return auth;
}

/**
 * Initialize Google OAuth provider
 * 
 * @param env Environment containing secrets and bindings
 * @param auth Lucia auth instance
 * @returns Google OAuth provider
 */
export function initializeGoogleProvider(auth: any, env: any) {
  // Temporary implementation that returns a simplified provider
  // with just enough to not break the code
  console.log('[OAuth] Using simplified Google provider until OAuth dependency is fixed');
  
  return {
    getAuthorizationUrl: async () => {
      // Create a Google OAuth URL manually
      const redirectUri = encodeURIComponent(`${env.API_URL || 'http://localhost:8787'}/api/auth/callback/google`);
      const clientId = env.GOOGLE_CLIENT_ID;
      const scope = encodeURIComponent('email profile');
      const state = crypto.randomUUID();
      
      console.log('[OAuth] Creating authorization URL with redirect:', redirectUri);
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
      
      return [url, state];
    },
    validateCallback: async (code: string) => {
      // Since we can't properly implement this without the OAuth library,
      // we'll just create a mock implementation that returns user data
      // In a real implementation, this would make API calls to Google
      console.log('[OAuth] Mock OAuth validation - would normally exchange code for tokens');
      
      return {
        getExistingUser: async () => null, // Always create a new user for testing
        googleUser: {
          email: 'test.oauth@example.com',
          name: 'OAuth Test User',
          sub: 'google-oauth2|123456789'
        },
        createUser: async (userData: any) => {
          // Create a user entry in the database
          console.log('[OAuth] Creating mock user with attributes:', userData.attributes);
          
          const userId = crypto.randomUUID();
          return {
            id: userId,
            ...userData.attributes
          };
        }
      };
    }
  };
}

/**
 * Helper function to get user data in a consistent format
 * 
 * @param user Lucia user
 * @returns Normalized user data
 */
export function formatUserResponse(user: any): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    emailVerified: user.emailVerified
  };
}

/**
 * Authenticate a request using Lucia with session cookies
 * 
 * @param request The incoming Request object
 * @param auth Lucia auth instance
 * @returns The authenticated Request with user data attached
 */
export async function authenticateRequest(
  request: Request,
  auth: any
): Promise<Request> {
  // Setup the session handler based on the request
  const sessionHandler = auth.handleRequest(request.method, {
    request: request.url,
    headers: request.headers,
  });

  // Validate session from cookie
  const { session, user } = await sessionHandler.validate();
  
  if (!session || !user) {
    throw new Error('Not authenticated: Invalid or missing session cookie');
  }

  // If the session is close to expiry, it will be extended automatically
  // by Lucia through the session handler

  // Attach user to request for downstream handlers
  (request as any).user = user;
  (request as any).session = session;

  return request;
}