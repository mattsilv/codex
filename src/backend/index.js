import { handleOptions, addCorsHeaders } from "./middleware/cors";
import { handleAuthRequest } from "./api/auth";
import { handlePromptRequest } from "./api/prompts";
import { handleResponseRequest } from "./api/responses";
import { authenticateRequest } from "./utils/auth";
import { seedTestData } from "./utils/seedTestData";

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Route to appropriate handler with CORS headers
    try {
      let response;

      // Public routes
      if (path === "/api/auth/login" || path === "/api/auth/register") {
        response = await handleAuthRequest(request, env, ctx);
        return addCorsHeaders(response);
      }
      
      // Development route for seeding test data
      if (path === "/api/seed-test-data" && env.ENVIRONMENT === "development") {
        const result = await seedTestData(env);
        response = new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        });
        return addCorsHeaders(response);
      }

      // Public prompt access for shared prompts
      if (path.match(/^\/api\/prompts\/[^\/]+$/) && request.method === "GET") {
        try {
          // Try to authenticate, but don't require it for GET requests to prompts
          // This allows public access to shared prompts
          request = await authenticateRequest(request, env);
        } catch (error) {
          // Continue without authentication
          // The prompt handler will check if the prompt is public
        }
        response = await handlePromptRequest(request, env, ctx);
        return addCorsHeaders(response);
      }

      // Protected routes - require authentication
      if (path.startsWith("/api/")) {
        try {
          request = await authenticateRequest(request, env);
        } catch (error) {
          return addCorsHeaders(
            new Response(JSON.stringify({ error: error.message }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        if (path.match(/^\/api\/prompts\/[^\/]+\/responses/)) {
          response = await handleResponseRequest(request, env, ctx);
        } else if (path.startsWith("/api/prompts")) {
          response = await handlePromptRequest(request, env, ctx);
        } else if (path.startsWith("/api/auth/")) {
          response = await handleAuthRequest(request, env, ctx);
        } else {
          response = new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return addCorsHeaders(response);
      }

      // Serve static assets for frontend (fallback)
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      } else {
        return new Response("Not found", { 
          status: 404,
          headers: { "Content-Type": "text/plain" }
        });
      }
    } catch (error) {
      // Handle any errors and add CORS headers
      console.error("Error processing request:", error);
      
      return addCorsHeaders(
        new Response(
          JSON.stringify({ 
            error: "Internal server error", 
            message: error.message 
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
  },
};