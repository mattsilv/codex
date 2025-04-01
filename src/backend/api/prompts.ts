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
  WorkerEnv,
  WorkerContext,
  PromptData
} from '../services/promptService.ts';
import { ApiError } from '../utils/errorHandler.ts';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../middleware/cors.ts';

/**
 * Request with user data
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

/**
 * Extract the prompt ID from the URL path
 * @param path - URL path
 * @returns Extracted prompt ID or null
 */
function extractPromptId(path: string): string | null {
  return path.match(/api\/prompts\/([a-zA-Z0-9_-]+)$/)?.[1] || null;
}

/**
 * Handle prompt API requests
 * @param request - HTTP request
 * @param env - Environment variables
 * @param ctx - Execution context
 * @returns HTTP response
 */
export async function handlePromptRequest(
  request: AuthenticatedRequest, 
  env: WorkerEnv, 
  ctx: WorkerContext
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const path = url.pathname;
    const promptId = extractPromptId(path);
    const method = request.method;
    const isPublicListing = path === '/api/prompts/public';

    // List prompts for user
    if (path === '/api/prompts' && method === 'GET' && request.user?.id) {
      const prompts = await getUserPrompts(env, request.user.id);
      return createSuccessResponse(request, prompts, 200, env);
    }

    // List public prompts
    if (isPublicListing && method === 'GET') {
      const prompts = await getPublicPrompts(env);
      return createSuccessResponse(request, prompts, 200, env);
    }

    // Create new prompt
    if (path === '/api/prompts' && method === 'POST' && request.user?.id) {
      const promptData = await request.json() as PromptData;
      const result = await createPrompt(env, request.user.id, promptData);
      return createSuccessResponse(request, result, 201, env);
    }

    // Get single prompt with responses
    if (promptId && method === 'GET') {
      const userId = request.user?.id || null;
      const prompt = await getPromptById(env, promptId, userId);
      return createSuccessResponse(request, prompt, 200, env);
    }

    // Update prompt
    if (promptId && method === 'PUT' && request.user?.id) {
      const promptData = await request.json() as PromptData;
      const result = await updatePrompt(
        env,
        promptId,
        request.user.id,
        promptData,
        ctx
      );
      return createSuccessResponse(request, result, 200, env);
    }

    // Delete prompt
    if (promptId && method === 'DELETE' && request.user?.id) {
      const result = await deletePrompt(env, promptId, request.user.id, ctx);
      return createSuccessResponse(request, result, 200, env);
    }

    // Handle unsupported routes
    return createErrorResponse(request, 404, 'NOT_FOUND', 'Endpoint not found', null, env);
  } catch (error) {
    console.error('Error handling prompt request:', error);

    // If it's our ApiError type, use its status and details
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

    // Otherwise return a generic 500 error
    return createErrorResponse(
      request,
      500,
      'SERVER_ERROR',
      'An unexpected error occurred',
      error instanceof Error ? error.message : String(error),
      env
    );
  }
}