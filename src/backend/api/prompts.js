/**
 * Prompts API Controller
 * Handles HTTP requests for prompt operations
 */

import {
  getUserPrompts,
  getPublicPrompts,
  createPrompt,
  getPromptById,
  updatePrompt,
  deletePrompt,
} from '../services/promptService.js';
import { ApiError } from '../utils/errorHandler.js';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../middleware/cors.js';

/**
 * Extract the prompt ID from the URL path
 * @param {string} path - URL path
 * @returns {string|null} - Extracted prompt ID or null
 */
function extractPromptId(path) {
  return path.match(/api\/prompts\/([a-zA-Z0-9_-]+)$/)?.[1] || null;
}

/**
 * Handle prompt API requests
 * @param {Request} request - HTTP request
 * @param {Object} env - Environment variables
 * @param {Object} ctx - Execution context
 * @returns {Response} - HTTP response
 */
export async function handlePromptRequest(request, env, ctx) {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    const promptId = extractPromptId(path);
    const method = request.method;
    const isPublicListing = path === '/api/prompts/public';

    // List prompts for user
    if (path === '/api/prompts' && method === 'GET') {
      const prompts = await getUserPrompts(env, request.user.id);
      return createSuccessResponse(prompts);
    }

    // List public prompts
    if (isPublicListing && method === 'GET') {
      const prompts = await getPublicPrompts(env);
      return createSuccessResponse(prompts);
    }

    // Create new prompt
    if (path === '/api/prompts' && method === 'POST') {
      const promptData = await request.json();
      const result = await createPrompt(env, request.user.id, promptData);
      return createSuccessResponse(result, 201);
    }

    // Get single prompt with responses
    if (promptId && method === 'GET') {
      const userId = request.user?.id || null;
      const prompt = await getPromptById(env, promptId, userId);
      return createSuccessResponse(prompt);
    }

    // Update prompt
    if (promptId && method === 'PUT') {
      const promptData = await request.json();
      const result = await updatePrompt(
        env,
        promptId,
        request.user.id,
        promptData,
        ctx
      );
      return createSuccessResponse(result);
    }

    // Delete prompt
    if (promptId && method === 'DELETE') {
      const result = await deletePrompt(env, promptId, request.user.id, ctx);
      return createSuccessResponse(result);
    }

    // Handle unsupported routes
    return createErrorResponse(404, 'NOT_FOUND', 'Endpoint not found');
  } catch (error) {
    console.error('Error handling prompt request:', error);

    // If it's our ApiError type, use its status and details
    if (error instanceof ApiError) {
      return createErrorResponse(
        error.status,
        error.code,
        error.message,
        error.details
      );
    }

    // Otherwise return a generic 500 error
    return createErrorResponse(
      500,
      'SERVER_ERROR',
      'An unexpected error occurred',
      error.message
    );
  }
}
