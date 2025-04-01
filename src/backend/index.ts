/**
 * Codex API Handler
 * Entry point for Cloudflare Workers backend
 * Using ESM modules in Cloudflare Workers environment
 */

// Import types for Cloudflare Workers - Assuming these are available via tsconfig
// You might need to install @cloudflare/workers-types
// import type { Request as CfRequest, ExecutionContext, KVNamespace, D1Database, R2Bucket } from '@cloudflare/workers-types';

// Local imports (keep .js extension as per instructions)
import {
  handleOptions,
  createErrorResponse,
  createSuccessResponse,
} from './middleware/cors.js';
import { handleAuthRequest } from './api/auth.js';
import { handlePromptRequest } from './api/prompts.js';
import { handleResponseRequest } from './api/responses.js';
import { authenticateRequest } from './utils/auth.js';
import { seedTestData } from './utils/seedTestData.js';
import { ApiError } from './utils/errorHandler.js';

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
        const isPublicAuthPath =
          path.startsWith('/api/auth/test-delete/') ||
          [
            '/api/auth/login',
            '/api/auth/register',
            '/api/auth/verify-email',
            '/api/auth/resend-verification',
            '/api/auth/process-deletions',
            '/api/auth/cancel-deletion',
            '/api/auth/test-get-verification-code',
          ].includes(path);

        if (isPublicAuthPath) {
          return await handleAuthRequest(request, env, ctx);
        }

        // Protected auth routes require authentication
        try {
          authenticatedRequest = await authenticateRequest(request, env);
          return await handleAuthRequest(authenticatedRequest, env, ctx);
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
            apiError.status,
            apiError.code,
            apiError.message,
            apiError.details
          );
        }
      }

      // Dev seeding route
      if (path === '/api/seed-test-data' && env.ENVIRONMENT === 'development') {
        const result = await seedTestData(env);
        return createSuccessResponse(result, 200, env);
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
            authenticatedRequest = await authenticateRequest(request, env);
          } catch {
            // Ignore auth errors for public reads, proceed with original request
            authenticatedRequest = request;
          }
        } else {
          // No auth needed or attempted for /api/prompts/public
          authenticatedRequest = request;
        }
        return await handlePromptRequest(authenticatedRequest, env, ctx);
      }

      // --- Default: Authenticate all other /api/ routes ---
      if (path.startsWith('/api/')) {
        try {
          authenticatedRequest = await authenticateRequest(request, env);
        } catch (error: unknown) {
          // Handle authentication failure
          console.error('Authentication error for general API route:', error);
          const apiError =
            error instanceof ApiError
              ? error
              : new ApiError(401, 'UNAUTHORIZED', 'Authentication required');
          return createErrorResponse(
            apiError.status,
            apiError.code,
            apiError.message,
            apiError.details
          );
        }

        // Route authenticated requests
        if (path.startsWith('/api/responses')) {
          return await handleResponseRequest(authenticatedRequest, env, ctx);
        } else if (path.startsWith('/api/prompts')) {
          // Handles POST, PUT, DELETE prompts (which required auth)
          return await handlePromptRequest(authenticatedRequest, env, ctx);
        } else {
          // Catch-all for authenticated /api/ routes not matched above
          return createErrorResponse(
            404,
            'NOT_FOUND',
            'API endpoint not found'
          );
        }
      }

      // --- Root path health check ---
      if (path === '/') {
        return createSuccessResponse(
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
          return createErrorResponse(status, 'ASSET_ERROR', message);
        }
      }

      // --- Fallback 404 Not Found ---
      console.warn(`404 Not Found for path: ${path}`);
      return createErrorResponse(404, 'NOT_FOUND', 'Resource not found');
    } catch (error: unknown) {
      // --- Global Error Handler ---
      console.error('Unhandled error in fetch handler:', error);

      if (error instanceof ApiError) {
        return createErrorResponse(
          error.status,
          error.code,
          error.message,
          error.details
        );
      }

      // For other errors, try to extract useful information safely
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      // Generic 500 error
      return createErrorResponse(
        500,
        'SERVER_ERROR',
        'An unexpected error occurred',
        // Provide stack trace only in development for security
        env.ENVIRONMENT === 'development'
          ? errorStack || errorMessage
          : undefined
      );
    }
  },

  // You can add other handlers like 'scheduled' here if needed
  // async scheduled(controller: ScheduledController, env: Env, ctx: CfExecutionContext): Promise<void> {
  //   // Handle scheduled events (e.g., cron triggers)
  // }
};
