/**
 * Simplified CORS middleware and error handling for Codex API
 */

/**
 * Environment interface
 */
export interface CorsEnv {
  ENVIRONMENT?: string;
  [key: string]: unknown;
}

/**
 * CORS Headers interface
 */
export interface CorsHeaders {
  'Access-Control-Allow-Origin': string;
  'Access-Control-Allow-Methods': string;
  'Access-Control-Allow-Headers': string;
  'Access-Control-Max-Age': string;
  'Access-Control-Allow-Credentials'?: string;
  [key: string]: string | undefined;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Success response interface
 */
export interface SuccessResponse {
  success: true;
  data: any;
}

// Common allowed origins for all environments
const allowedOrigins: Record<string, string[]> = {
  development: [
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    'http://localhost:8787'
  ],
  production: [
    'https://codex.silv.app',
    'https://api.codex.silv.app',
    'https://codex-abq.pages.dev'
  ]
};

/**
 * Get CORS headers for a request
 * @param request - The incoming request
 * @param env - Environment variables
 * @returns CORS headers
 */
function getCorsHeaders(request: Request, env: CorsEnv): CorsHeaders {
  const origin = request.headers.get('Origin') || '';
  const environment = (env.ENVIRONMENT === 'production') ? 'production' : 'development';
  
  console.log(`[CORS] Request from origin: ${origin}, Environment: ${environment}`);
  
  // Common headers for all responses
  const headers: CorsHeaders = {
    'Access-Control-Allow-Origin': '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
  
  // Check if origin is in allowed list
  const isAllowedOrigin = allowedOrigins[environment].includes(origin);
  
  if (origin && isAllowedOrigin) {
    // Set the exact origin and allow credentials
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    console.log(`[CORS] Allowed specific origin with credentials: ${origin}`);
  } else if (environment === 'development') {
    // In development, allow any origin without credentials
    headers['Access-Control-Allow-Origin'] = '*';
    console.log('[CORS] Development mode - allowing any origin without credentials');
  } else {
    // In production, only allow the main production origin
    headers['Access-Control-Allow-Origin'] = 'https://codex.silv.app';
    console.log('[CORS] Production mode - defaulting to main production origin');
  }
  
  return headers;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleOptions(request: Request, env: CorsEnv = {}): Response {
  console.log(`[OPTIONS] Handling preflight for: ${new URL(request.url).pathname}`);
  
  const corsHeaders = getCorsHeaders(request, env);
  
  // Add requested headers if this is a proper preflight
  if (request.headers.get('Access-Control-Request-Headers')) {
    corsHeaders['Access-Control-Allow-Headers'] = 
      request.headers.get('Access-Control-Request-Headers') || corsHeaders['Access-Control-Allow-Headers'];
  }
  
  console.log('[OPTIONS] Response headers:', corsHeaders);
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  request: Request,
  status: number,
  code: string,
  message: string,
  details: any = null,
  env: CorsEnv = {}
): Response {
  console.log(`[ERROR] ${status} ${code}: ${message}`);
  
  const errorBody: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };

  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(request, env)
  };
  
  return new Response(JSON.stringify(errorBody), {
    status,
    headers
  });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse(
  request: Request,
  data: any,
  status: number = 200,
  env: CorsEnv = {}
): Response {
  console.log(`[SUCCESS] ${status}: ${new URL(request.url).pathname}`);
  
  const responseBody: SuccessResponse = {
    success: true,
    data
  };

  const headers = {
    'Content-Type': 'application/json',
    ...getCorsHeaders(request, env)
  };
  
  return new Response(JSON.stringify(responseBody), {
    status,
    headers
  });
}