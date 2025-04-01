/**
 * Codex API Handler
 * Entry point for Cloudflare Workers backend
 * Using ESM modules in Cloudflare Workers environment
 */

// Import types for Cloudflare Workers - Assuming these are available via tsconfig
// You might need to install @cloudflare/workers-types
// import type { Request as CfRequest, ExecutionContext, KVNamespace, D1Database, R2Bucket } from '@cloudflare/workers-types';

// Local imports (keep .js extension for some imports as per instructions)
import {
  handleOptions,
  createErrorResponse,
  createSuccessResponse,
} from './middleware/cors.ts';
import { handleAuthRequest } from './api/auth.ts';
import { handlePromptRequest } from './api/prompts.ts';
import { handleResponseRequest } from './api/responses.ts';
import { authenticateRequest, initializeLucia } from './utils/auth.ts';
import { seedTestData } from './utils/seedTestData.ts';
import { resetDatabase } from './utils/resetDatabase.ts';
import { ApiError } from './utils/errorHandler.ts';

/**
 * Define the environment bindings expected by the Worker.
 * Add specific types for KV, R2, D1, Services, Secrets etc. as needed.
 * Example: DB: D1Database; MY_KV: KVNamespace; SECRET_KEY: string;
 */
export interface Env {
  ENVIRONMENT?: 'development' | 'production' | 'staging';
  // This binding is used for Pages Functions or specific service bindings.
  // If using standard Workers KV/R2 assets, this might be different
  // (e.g., __STATIC_CONTENT: KVNamespace for KV assets).
  ASSETS?: { fetch: (request: Request) => Promise<Response> };
  DB?: unknown; // Placeholder: Replace with D1Database if using D1
  AUTH_STORE?: unknown; // Placeholder: Replace if using a specific binding (e.g., KVNamespace)
  // Add other expected environment variables and bindings here
  AUTH_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  [key: string]: unknown; // Allows for flexibility but specific types are preferred
}

/**
 * Define the structure of the execution context.
 * Using 'any' for now, but ExecutionContext from @cloudflare/workers-types is preferred.
 */
type CfExecutionContext = unknown; // Replace with ExecutionContext from workers-types if available

/**
 * Main API handler for Cloudflare Workers.
 * Uses `satisfies ExportedHandler<Env>` for type checking against the expected interface.
 */
export default {
  /**
   * Process incoming HTTP requests.
   */
  async fetch(
    request: Request, // Standard Fetch API Request type
    env: Env,
    ctx: CfExecutionContext // Cloudflare Workers ExecutionContext
  ): Promise<Response> {
    // Standard Fetch API Response type

    // --- Log Environment --- 
    console.log(`[Worker Env] ENVIRONMENT: ${env.ENVIRONMENT ?? 'undefined'}`);

    // Initialize Lucia Auth
    const auth = initializeLucia(env);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      // Assuming handleOptions returns Response or Promise<Response>
      return handleOptions(request, env);
    }

    const url = new URL(request.url);
    const path: string = url.pathname;

    // Log request info in development mode
    if (env.ENVIRONMENT === 'development') {
      console.log(`Request: ${request.method} ${path}`);
    }

    try {
      let authenticatedRequest: Request = request; // Use a separate variable

      // --- Routing Logic ---

      // Public auth endpoints (allow specific paths without auth)
      if (path.startsWith('/api/auth')) {
        // Log the auth path being accessed
        console.log(`[Auth] Handling auth request: ${path}`);
        
        const isPublicAuthPath =
          path.startsWith('/api/auth/test-delete/') ||
          [
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/verify-email',
            '/api/auth/google',
            '/api/auth/callback/google',
            '/api/auth/resend-verification',
            '/api/auth/process-deletions',
            '/api/auth/cancel-deletion',
            '/api/auth/test-get-verification-code',
          ].includes(path);

        if (isPublicAuthPath) {
          return await handleAuthRequest(request, env, ctx as any);
        }

        // Protected auth routes require authentication
        try {
          authenticatedRequest = await authenticateRequest(request, auth);
          return await handleAuthRequest(authenticatedRequest, env, ctx as any);
        } catch (error: unknown) {
          // Handle authentication failure
          console.error(
            'Authentication error for protected auth route:',
            error
          );
          const apiError =
            error instanceof ApiError
              ? error
              : new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
          return createErrorResponse(
            authenticatedRequest,
            apiError.status,
            apiError.code,
            apiError.message,
            apiError.details,
            env
          );
        }
      }

      // Dev seeding route
      if (path === '/api/seed-test-data' && env.ENVIRONMENT === 'development') {
        const result = await seedTestData(env);
        return createSuccessResponse(request, result, 200, env);
      }
      
      // Dev database reset route (reset and seed fresh data)
      if ((path === '/api/reset-and-seed-db' || path === '/api/reset-db') && 
          request.method === 'POST' && env.ENVIRONMENT === 'development') {
        console.log(`Received request to ${path === '/api/reset-db' ? 'completely reset' : 'reset and seed'} database`);
        
        try {
          // Only proceed if the admin key header is present
          const adminKey = request.headers.get('X-Admin-Key');
          
          if (!adminKey) {
            return createErrorResponse(
              request,
              401,
              'UNAUTHORIZED',
              'Admin key required',
              null,
              env
            );
          }
          
          // Parse the request body if available
          let forceClean = false;
          try {
            const body = await request.json();
            forceClean = !!body.forceClean;
          } catch (e) {
            // Ignore JSON parsing errors
          }
          
          if (forceClean) {
            console.log('FORCE CLEAN mode enabled - completely resetting database');
          }
          
          // Run the reset operation
          const result = await resetDatabase(env, adminKey);
          
          if (result.success) {
            return createSuccessResponse(
              request,
              {
                ...result,
                testCredentials: {
                  email: 'alice@example.com',
                  password: 'password123'
                },
                forceClean
              },
              200,
              env
            );
          } else {
            return createErrorResponse(
              request,
              500,
              'RESET_FAILED',
              result.message,
              { error: result.error },
              env
            );
          }
        } catch (error) {
          console.error('Error resetting database:', error);
          return createErrorResponse(
            request,
            500,
            'INTERNAL_SERVER_ERROR',
            'Failed to reset database',
            null,
            env
          );
        }
      }

      // Public GET prompts (single or listing)
      const isPublicPromptGet =
        request.method === 'GET' &&
        (path.match(/^\/api\/prompts\/[a-zA-Z0-9_-]+$/) || // Matches /api/prompts/:id
          path === '/api/prompts/public'); // Matches /api/prompts/public

      if (isPublicPromptGet) {
        if (path !== '/api/prompts/public') {
          // Try auth only for specific prompt fetch, not public listing
          try {
            // Attempt authentication but don't require it
            authenticatedRequest = await authenticateRequest(request, auth);
          } catch {
            // Ignore auth errors for public reads, proceed with original request
            authenticatedRequest = request;
          }
        } else {
          // No auth needed or attempted for /api/prompts/public
          authenticatedRequest = request;
        }
        return await handlePromptRequest(authenticatedRequest, env, ctx as any);
      }

      // --- Health check endpoint (needs to be before the auth check) ---
      if (path === '/api/health') {
        return createSuccessResponse(
          request,
          {
            status: 'ok',
            version: '1.0',
            environment: env.ENVIRONMENT || 'unknown',
          },
          200,
          env
        );
      }
      
      // --- Default: Authenticate all other /api/ routes ---
      if (path.startsWith('/api/')) {
        try {
          authenticatedRequest = await authenticateRequest(request, auth);
        } catch (error: unknown) {
          // Handle authentication failure
          console.error('Authentication error for general API route:', error);
          const apiError =
            error instanceof ApiError
              ? error
              : new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
          return createErrorResponse(
            request,
            apiError.status,
            apiError.code,
            apiError.message,
            apiError.details,
            env
          );
        }

        // Route authenticated requests
        if (path.startsWith('/api/responses')) {
          return await handleResponseRequest(authenticatedRequest, env, ctx as any);
        } else if (path.startsWith('/api/prompts')) {
          // Handles POST, PUT, DELETE prompts (which required auth)
          return await handlePromptRequest(authenticatedRequest, env, ctx as any);
        } else {
          // Catch-all for authenticated /api/ routes not matched above
          return createErrorResponse(
            authenticatedRequest,
            404,
            'NOT_FOUND',
            'API endpoint not found',
            null,
            env
          );
        }
      }

      // --- Root path health check ---
      if (path === '/') {
        return createSuccessResponse(
          request,
          {
            status: 'ok',
            version: '1.0', // Consider making this dynamic (e.g., from env or build step)
            environment: env.ENVIRONMENT || 'unknown',
          },
          200,
          env
        );
      }

      // --- Static Asset Serving (via ASSETS binding) ---
      if (env.ASSETS) {
        try {
          return await env.ASSETS.fetch(request);
        } catch (assetError: unknown) {
          console.error('Error fetching static asset:', assetError);
          // Don't expose internal errors unless in development
          // Handle error message extraction safely
          const errorMessage =
            assetError instanceof Error
              ? assetError.message
              : String(assetError);

          const message =
            env.ENVIRONMENT === 'development'
              ? errorMessage
              : 'Static asset not found';
          // Check if it looks like a file not found error
          const status = errorMessage.includes('could not find item')
            ? 404
            : 500;
          return createErrorResponse(request, status, 'ASSET_ERROR', message, null, env);
        }
      }

      // --- Fallback 404 Not Found ---
      console.warn(`404 Not Found for path: ${path}`);
      return createErrorResponse(request, 404, 'NOT_FOUND', 'Resource not found', null, env);
    } catch (error: unknown) {
      // --- Global Error Handler ---
      console.error('Unhandled error in fetch handler:', error);

      if (error instanceof ApiError) {
        return createErrorResponse(
          request,
          error.status,
          error.code,
          error.message,
          error.details,
          env
        );
      }

      // Generic internal server error
      return createErrorResponse(
        request,
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        null,
        env
      );
    } finally {
      // Add any cleanup logic here if needed
    }
  },

  // You can add other handlers like 'scheduled' here if needed
  // async scheduled(controller: ScheduledController, env: Env, ctx: CfExecutionContext): Promise<void> {
  //   // Handle scheduled events (e.g., cron triggers)
  // }
};