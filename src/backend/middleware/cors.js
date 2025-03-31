// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with specific domains in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400", // 24 hours
};

// Handle preflight OPTIONS requests
export function handleOptions(request) {
  // Make sure the necessary headers are present for a valid pre-flight request
  if (
    request.headers.get("Origin") !== null &&
    request.headers.get("Access-Control-Request-Method") !== null &&
    request.headers.get("Access-Control-Request-Headers") !== null
  ) {
    // Create response headers by combining corsHeaders with requested headers
    const respHeaders = {
      ...corsHeaders,
      "Access-Control-Allow-Headers": request.headers.get(
        "Access-Control-Request-Headers"
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

// Wrapper for adding CORS headers to any response
export function addCorsHeaders(response) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}