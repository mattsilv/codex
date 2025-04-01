// Enhanced CORS middleware and error handling for Codex API
// Following 3-31 troubleshooting document

/**
 * Whether the application is running in development mode
 * This will be dynamically determined from the env parameter
 */
let isDev = false; // Default to production mode

// This will be set dynamically from incoming requests

/**
 * Allowed origins for local development
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite's default
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://localhost:8787',
  'https://codex.silv.app', // Adding production domain for local testing
];

/**
 * Production domain settings
 */
const productionOrigin = 'https://codex.silv.app';
const apiProductionOrigin = 'https://api.codex.silv.app';
const allowedProductionOrigins = [productionOrigin, apiProductionOrigin];

/**
 * Handle CORS with dynamic origin detection
 * @param {Request} request - The incoming request
 * @param {Object} env - Environment variables from the worker
 * @returns {Object} - CORS headers for this request
 */
function handleCors(request, env) {
  // Set development mode based on environment
  isDev = env && env.ENVIRONMENT === 'development';

  const origin = request.headers.get('Origin');

  let corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };

  // In development, check against allowed origins
  if (isDev && origin && allowedOrigins.includes(origin)) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  // In production, check against allowed production origins
  else if (!isDev && origin) {
    if (allowedProductionOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    } else {
      corsHeaders['Access-Control-Allow-Origin'] = productionOrigin;
    }
  }
  // Fallback for development if origin not in allowlist
  else if (isDev) {
    corsHeaders['Access-Control-Allow-Origin'] = '*';
    console.log(`Warning: Using wildcard CORS for unknown origin: ${origin}`);
  }

  return corsHeaders;
}

/**
 * Handle preflight OPTIONS requests
 * @param {Request} request - The incoming OPTIONS request
 * @param {Object} [env] - Environment variables from the worker
 * @returns {Response} - Preflight response with appropriate CORS headers
 */
export function handleOptions(request, env = {}) {
  // Get cors headers for the current request
  const corsHeaders = handleCors(request, env);

  // Make sure the necessary headers are present for a valid pre-flight request
  if (
    request.headers.get('Origin') !== null &&
    request.headers.get('Access-Control-Request-Method') !== null &&
    request.headers.get('Access-Control-Request-Headers') !== null
  ) {
    // Create response headers by combining corsHeaders with requested headers
    const respHeaders = {
      ...corsHeaders,
      'Access-Control-Allow-Headers': request.headers.get(
        'Access-Control-Request-Headers'
      ),
    };

    // Return successful preflight response with appropriate headers
    return new Response(null, {
      headers: respHeaders,
    });
  }

  // Handle standard OPTIONS request
  return new Response(null, {
    headers: corsHeaders,
  });
}

/**
 * Add CORS headers to any response
 * @param {Response} response - The response to add headers to
 * @param {Object} [env] - Environment variables from the worker
 * @returns {Response} - New response with CORS headers
 */
export function addCorsHeaders(response, env = {}) {
  // Set development mode based on environment
  isDev = env && env.ENVIRONMENT === 'development';

  const newResponse = new Response(response.body, response);

  // Since we can't access the original request here, use a simple approach
  // In development mode, allow all origins for simplicity
  if (isDev) {
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    // In production, we default to the main frontend origin
    // The more precise origin handling is done in handleCors()
    newResponse.headers.set('Access-Control-Allow-Origin', productionOrigin);
  }

  newResponse.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  newResponse.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  newResponse.headers.set('Access-Control-Max-Age', '86400');
  newResponse.headers.set('Vary', 'Origin');

  return newResponse;
}

/**
 * Create a standardized error response
 * @param {number} status - HTTP status code
 * @param {string} code - Error code for client
 * @param {string} message - Human-readable error message
 * @param {Object} [details=null] - Additional error details (optional)
 * @param {Object} [env] - Environment variables from the worker
 * @returns {Response} - Formatted JSON error response with CORS headers
 */
export function createErrorResponse(
  status,
  code,
  message,
  details = null,
  env = {}
) {
  const errorBody = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    errorBody.error.details = details;
  }

  // Create response with CORS headers
  const response = new Response(JSON.stringify(errorBody), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return addCorsHeaders(response, env);
}

/**
 * Create a standardized success response
 * @param {any} data - The response data
 * @param {number} [status=200] - HTTP status code (default: 200)
 * @param {Object} [env] - Environment variables from the worker
 * @returns {Response} - Formatted JSON success response with CORS headers
 */
export function createSuccessResponse(data, status = 200, env = {}) {
  const responseBody = {
    success: true,
    data,
  };

  // Create response with CORS headers
  const response = new Response(JSON.stringify(responseBody), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return addCorsHeaders(response, env);
}
