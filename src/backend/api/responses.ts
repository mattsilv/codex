import { createDb } from '../db/client.ts';
import { prompts, responses } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { storeContent, getContent, deleteContent } from '../utils/storage.ts';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../middleware/cors.ts';

/**
 * Environment interface for Workers
 */
export interface WorkerEnv {
  DB?: any;
  CONTENT_STORE?: any;
  [key: string]: any;
}

/**
 * Context interface for Workers
 */
export interface WorkerContext {
  waitUntil?: (promise: Promise<any>) => void;
  [key: string]: any;
}

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
 * Response data interface
 */
interface ResponseData {
  modelName: string;
  content: string;
  isMarkdown?: boolean;
}

export async function handleResponseRequest(
  request: AuthenticatedRequest, 
  env: WorkerEnv, 
  ctx: WorkerContext
): Promise<Response> {
  const db = createDb(env.DB);
  const url = new URL(request.url);
  const path = url.pathname;

  // Extract IDs from path
  // Format: /api/prompts/:promptId/responses
  // or:     /api/prompts/:promptId/responses/:responseId
  const responseMatch = path.match(
    /api\/prompts\/([^/]+)\/responses(?:\/([^/]+))?$/
  );

  if (!responseMatch) {
    return createErrorResponse(
      request, 
      400, 
      'INVALID_PATH', 
      'Invalid path', 
      null, 
      env
    );
  }

  const promptId = responseMatch[1];
  const responseId = responseMatch[2];

  // Verify prompt exists and user has access
  const [prompt] = await db
    .select()
    .from(prompts)
    .where(eq(prompts.id, promptId))
    .limit(1);

  if (!prompt) {
    return createErrorResponse(
      request, 
      404, 
      'NOT_FOUND', 
      'Prompt not found', 
      null, 
      env
    );
  }

  // Check if user has access to this prompt
  if (!prompt.isPublic && prompt.userId !== request.user?.id) {
    return createErrorResponse(
      request, 
      403, 
      'FORBIDDEN', 
      "You don't have permission to access this prompt", 
      null, 
      env
    );
  }

  // List responses for a prompt
  if (!responseId && request.method === 'GET') {
    const promptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.promptId, promptId))
      .orderBy(responses.createdAt);

    // Don't include the full content, just metadata
    return createSuccessResponse(request, promptResponses, 200, env);
  }

  // Create new response for a prompt
  if (!responseId && request.method === 'POST') {
    try {
      const { modelName, content, isMarkdown = true } = await request.json() as ResponseData;

      if (!modelName || !content) {
        return createErrorResponse(
          request,
          400,
          'VALIDATION_ERROR',
          'Model name and response content are required',
          null,
          env
        );
      }

      // Check if a response with this model already exists
      const existingModel = await db
        .select()
        .from(responses)
        .where(
          and(
            eq(responses.promptId, promptId),
            eq(responses.modelName, modelName)
          )
        )
        .limit(1);

      if (existingModel.length > 0) {
        return createErrorResponse(
          request,
          409,
          'CONFLICT',
          `A response with the model "${modelName}" already exists for this prompt`,
          null,
          env
        );
      }

      // Store full content in R2
      const contentBlobKey = await storeContent(env, content, 'response');

      // Store metadata in D1
      const contentPreview =
        content.substring(0, 100) + (content.length > 100 ? '...' : '');
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.insert(responses).values({
        id,
        promptId,
        modelName,
        contentPreview,
        contentBlobKey,
        isMarkdown,
        createdAt: now,
        updatedAt: now,
      });

      return createSuccessResponse(
        request,
        {
          id,
          message: 'Response created successfully',
        },
        201,
        env
      );
    } catch (error) {
      return createErrorResponse(
        request,
        500,
        'INTERNAL_SERVER_ERROR',
        'Failed to create response',
        error instanceof Error ? error.message : String(error),
        env
      );
    }
  }

  // Get a specific response
  if (responseId && request.method === 'GET') {
    try {
      const [responseData] = await db
        .select()
        .from(responses)
        .where(
          and(eq(responses.id, responseId), eq(responses.promptId, promptId))
        )
        .limit(1);

      if (!responseData) {
        return createErrorResponse(
          request,
          404,
          'NOT_FOUND',
          'Response not found',
          null,
          env
        );
      }

      // Get full content from R2
      const content = await getContent(env, responseData.contentBlobKey);

      return createSuccessResponse(
        request,
        {
          ...responseData,
          content,
        },
        200,
        env
      );
    } catch (error) {
      return createErrorResponse(
        request,
        500,
        'INTERNAL_SERVER_ERROR',
        'Failed to retrieve response',
        error instanceof Error ? error.message : String(error),
        env
      );
    }
  }

  // Update a response
  if (responseId && request.method === 'PUT') {
    try {
      // First check if the response exists
      const [existingResponse] = await db
        .select()
        .from(responses)
        .where(
          and(eq(responses.id, responseId), eq(responses.promptId, promptId))
        )
        .limit(1);

      if (!existingResponse) {
        return createErrorResponse(
          request,
          404,
          'NOT_FOUND',
          'Response not found',
          null,
          env
        );
      }

      const { modelName, content, isMarkdown } = await request.json() as ResponseData;
      const updateData: Record<string, any> = {
        updatedAt: new Date().toISOString(),
      };

      if (modelName !== undefined) updateData.modelName = modelName;
      if (isMarkdown !== undefined) updateData.isMarkdown = isMarkdown;

      // If content is updated, store it in R2 and update the key
      if (content) {
        // Store new content in R2
        const contentBlobKey = await storeContent(env, content, 'response');
        updateData.contentBlobKey = contentBlobKey;
        updateData.contentPreview =
          content.substring(0, 100) + (content.length > 100 ? '...' : '');

        // Delete old content from R2 (asynchronously, don't wait for it)
        if (ctx.waitUntil) {
          ctx.waitUntil(deleteContent(env, existingResponse.contentBlobKey));
        } else {
          // Fallback if waitUntil is not available
          void deleteContent(env, existingResponse.contentBlobKey);
        }
      }

      // Update response in D1
      await db
        .update(responses)
        .set(updateData)
        .where(eq(responses.id, responseId));

      return createSuccessResponse(
        request,
        { message: 'Response updated successfully' },
        200,
        env
      );
    } catch (error) {
      return createErrorResponse(
        request,
        500,
        'INTERNAL_SERVER_ERROR',
        'Failed to update response',
        error instanceof Error ? error.message : String(error),
        env
      );
    }
  }

  // Delete a response
  if (responseId && request.method === 'DELETE') {
    try {
      // First check if the response exists
      const [existingResponse] = await db
        .select()
        .from(responses)
        .where(
          and(eq(responses.id, responseId), eq(responses.promptId, promptId))
        )
        .limit(1);

      if (!existingResponse) {
        return createErrorResponse(
          request,
          404,
          'NOT_FOUND',
          'Response not found',
          null,
          env
        );
      }

      // Delete from D1
      await db.delete(responses).where(eq(responses.id, responseId));

      // Delete content from R2 (asynchronously)
      if (ctx.waitUntil) {
        ctx.waitUntil(deleteContent(env, existingResponse.contentBlobKey));
      } else {
        // Fallback if waitUntil is not available
        void deleteContent(env, existingResponse.contentBlobKey);
      }

      return createSuccessResponse(
        request,
        { message: 'Response deleted successfully' },
        200,
        env
      );
    } catch (error) {
      return createErrorResponse(
        request,
        500,
        'INTERNAL_SERVER_ERROR',
        'Failed to delete response',
        error instanceof Error ? error.message : String(error),
        env
      );
    }
  }

  return createErrorResponse(
    request,
    404,
    'NOT_FOUND',
    'Endpoint not found',
    null,
    env
  );
}