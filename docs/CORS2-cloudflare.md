# Cloudflare CORS Configuration for Cookie-Based Authentication

## Overview

For cookie-based authentication to work properly across domains (e.g., between your frontend and backend), proper CORS configuration is essential. This document explains how to configure CORS with Cloudflare Workers, especially for supporting credentials (cookies).

## Key CORS Headers for Cookie Authentication

```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true  // This is critical for cookie auth!
```

The most important header is `Access-Control-Allow-Credentials: true` which tells browsers it's safe to send cookies with requests to this domain.

## Middleware Implementation

Cloudflare Worker CORS middleware should:

1. Handle preflight (OPTIONS) requests
2. Add appropriate CORS headers to all responses
3. Support the credentials needed for cookie-based auth

Here's an example implementation:

```typescript
// CORS middleware for Cloudflare Workers with cookie support
export async function handleCors(request: Request): Promise<Response | null> {
  // Get the origin from the request
  const origin = request.headers.get('Origin') || '';
  
  // List of allowed origins (update these to your domains)
  const allowedOrigins = [
    'https://codex.silv.app',
    'https://codex-abq.pages.dev',
    'http://localhost:3001'
  ];
  
  // Default headers
  const corsHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    // Critical for cookie-based auth to work!
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Check if the origin is allowed
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  // Only add Access-Control-Allow-Origin for allowed origins, and it must match the request origin
  if (isAllowedOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
  }
  
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  // For other methods, return null to continue processing the request
  // The corsHeaders will be added to the final response later
  return null;
}

// Helper to add CORS headers to any response
export function addCorsHeaders(
  response: Response, 
  request: Request
): Response {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigins = [
    'https://codex.silv.app',
    'https://codex-abq.pages.dev',
    'http://localhost:3001'
  ];
  
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  const headers = new Headers(response.headers);
  
  // Add basic CORS headers
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Only set Allow-Origin for allowed origins
  if (isAllowedOrigin) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Usage in your main handler:
export async function handleRequest(request: Request, env: Env): Promise<Response> {
  // Handle CORS preflight requests
  const corsResponse = await handleCors(request);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Process the request normally
  let response: Response;
  try {
    // Your main request processing logic here
    response = await processRequest(request, env);
  } catch (error) {
    response = new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Add CORS headers to the response
  return addCorsHeaders(response, request);
}
```

## Cookie Security Settings

For HTTP-only cookies to work properly across domains, ensure your cookie settings are configured correctly:

```typescript
// When setting cookies in your authentication logic:
const cookie = {
  name: 'session',
  value: sessionToken,
  path: '/',
  httpOnly: true,
  secure: isProduction, // true in production
  sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-domain cookies
  expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
};

// Add the cookie to your response
response.headers.set('Set-Cookie', serializeCookie(cookie));
```

The critical settings for cross-domain cookies are:
- `httpOnly: true` (prevents JS access)
- `secure: true` (requires HTTPS)
- `sameSite: 'none'` (allows cross-domain sharing)

## Common CORS Issues with Cookie Auth

1. **Missing Allow-Credentials Header**: Ensure `Access-Control-Allow-Credentials: true` is set on all responses.

2. **Wildcard Origin with Credentials**: You cannot use `Access-Control-Allow-Origin: *` when using credentials. The origin must be explicitly specified.

3. **Missing Cookie Settings**: Cookies must have appropriate settings to work cross-domain (secure, sameSite, etc.)

4. **API Calls Without Credentials**: Frontend fetch calls must include `credentials: 'include'`

## Testing CORS Configuration

Use the "Test API Connection" button on the login page to verify proper CORS setup. The console will show detailed debugging information about:

1. Request headers being sent
2. Response headers received
3. Cookie presence and handling 
4. Authentication results

If authentication fails with CORS errors, check:
1. Frontend: Ensure `credentials: 'include'` in fetch options
2. Backend: Verify CORS headers include `Access-Control-Allow-Credentials: true`
3. Backend: Verify the origin matches exactly what's in `Access-Control-Allow-Origin`