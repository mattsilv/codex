// TypeScript Cloudflare Worker that returns a 200 response
// This is a placeholder until we've migrated all the backend code to be compatible

/**
 * Environment bindings for the Cloudflare Worker
 */
interface Env {
  ENVIRONMENT: string;
  DB: D1Database;
  CONTENT_STORE: R2Bucket;
}

/**
 * Response shape for API responses
 */
interface ApiResponse {
  success: boolean;
  message: string;
  environment: string;
  request: {
    url: string;
    method: string;
    path: string;
    headers: Record<string, string>;
  };
  nextSteps: string;
}

/**
 * MIGRATION ROADMAP:
 * 1. Update all imports to use .js extensions
 * 2. Replace bcryptjs with Web Crypto API for authentication
 * 3. Update storage.js to properly handle env.CONTENT_STORE
 * 4. Test each endpoint individually
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Return a helpful status message
    const responseBody: ApiResponse = {
      success: true,
      message: 'Backend service is running',
      environment: env.ENVIRONMENT || 'unknown',
      request: {
        url: request.url,
        method: request.method,
        path: path,
        headers: Object.fromEntries([...request.headers]),
      },
      nextSteps:
        'Follow the migration roadmap in docs/3-31-troubleshoot.md to implement the full backend',
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  },
};
