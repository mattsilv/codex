/**
 * Prompt Service Layer
 * Handles business logic for managing prompts
 */

import { createDb } from '../db/client.ts';
import { prompts, responses } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { storeContent, getContent, deleteContent } from '../utils/storage.ts';
import {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  tryCatch,
} from '../utils/errorHandler.ts';

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
 * Prompt data interface
 */
export interface PromptData {
  title?: string;
  content?: string;
  isPublic?: boolean;
  tags?: string[] | null;
}

/**
 * Response data with content
 */
export interface ResponseWithContent {
  id: string;
  promptId: string;
  modelName: string;
  contentPreview: string;
  contentBlobKey: string;
  isMarkdown: boolean;
  createdAt: string;
  updatedAt: string;
  content: string;
}

/**
 * Prompt with responses
 */
export interface PromptWithResponses {
  id: string;
  userId: string;
  title: string | null;
  contentPreview: string;
  contentBlobKey: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string | null;
  content: string;
  responses: ResponseWithContent[];
}

/**
 * Get all prompts for a user
 * @param env - Environment variables
 * @param userId - User ID
 * @returns Array of prompts
 */
export async function getUserPrompts(env: WorkerEnv, userId: string): Promise<any[]> {
  return tryCatch(async () => {
    const db = createDb(env.DB);

    const userPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.userId, userId))
      .orderBy(prompts.updatedAt);

    return userPrompts;
  });
}

/**
 * Get all public prompts
 * @param env - Environment variables
 * @returns Array of public prompts
 */
export async function getPublicPrompts(env: WorkerEnv): Promise<any[]> {
  return tryCatch(async () => {
    const db = createDb(env.DB);

    const publicPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.isPublic, true))
      .orderBy(prompts.updatedAt);

    return publicPrompts;
  });
}

/**
 * Create a new prompt
 * @param env - Environment variables
 * @param userId - User ID
 * @param promptData - Prompt data
 * @returns Created prompt
 */
export async function createPrompt(
  env: WorkerEnv, 
  userId: string, 
  promptData: PromptData
): Promise<{ id: string; message: string }> {
  return tryCatch(async () => {
    const { title, content, isPublic, tags } = promptData;

    if (!content) {
      throw createValidationError('Prompt content is required');
    }

    const db = createDb(env.DB);

    // Store full content in R2
    const contentBlobKey = await storeContent(env, content, 'prompt');

    // Store metadata in D1
    const contentPreview =
      content.substring(0, 100) + (content.length > 100 ? '...' : '');
    const promptId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(prompts).values({
      id: promptId,
      userId,
      title: title || '',
      contentPreview,
      contentBlobKey,
      isPublic: !!isPublic,
      createdAt: now,
      updatedAt: now,
      tags: tags ? JSON.stringify(tags) : null,
    });

    return { id: promptId, message: 'Prompt created successfully' };
  });
}

/**
 * Get a prompt by ID with responses
 * @param env - Environment variables
 * @param promptId - Prompt ID
 * @param userId - User ID (can be null for public prompts)
 * @returns Prompt with responses
 */
export async function getPromptById(
  env: WorkerEnv, 
  promptId: string, 
  userId: string | null = null
): Promise<PromptWithResponses> {
  return tryCatch(async () => {
    const db = createDb(env.DB);

    // Get prompt metadata from D1
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, promptId))
      .limit(1);

    if (!prompt) {
      throw createNotFoundError('Prompt', promptId);
    }

    // Check access permissions
    if (!prompt.isPublic && prompt.userId !== userId) {
      throw createForbiddenError(
        "You don't have permission to access this prompt"
      );
    }

    // Get full content from R2
    const content = await getContent(env, prompt.contentBlobKey);

    // Get responses from D1
    const promptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.promptId, promptId))
      .orderBy(responses.createdAt);

    // Fetch full response contents from R2
    const responsesWithContent = await Promise.all(
      promptResponses.map(async (response) => {
        const content = await getContent(env, response.contentBlobKey);
        return { ...response, content } as ResponseWithContent;
      })
    );

    return {
      ...prompt,
      content,
      responses: responsesWithContent,
    };
  });
}

/**
 * Update a prompt
 * @param env - Environment variables
 * @param promptId - Prompt ID
 * @param userId - User ID
 * @param promptData - Updated prompt data
 * @param ctx - Context for waitUntil
 * @returns Update result
 */
export async function updatePrompt(
  env: WorkerEnv, 
  promptId: string, 
  userId: string, 
  promptData: PromptData,
  ctx: WorkerContext
): Promise<{ message: string }> {
  return tryCatch(async () => {
    const db = createDb(env.DB);

    // Check if prompt exists and belongs to user
    const [existingPrompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)))
      .limit(1);

    if (!existingPrompt) {
      throw createNotFoundError('Prompt', promptId);
    }

    const { title, content, isPublic, tags } = promptData;
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    // If content is updated, store it in R2 and update the key
    if (content) {
      // Store new content in R2
      const contentBlobKey = await storeContent(env, content, 'prompt');
      updateData.contentBlobKey = contentBlobKey;
      updateData.contentPreview =
        content.substring(0, 100) + (content.length > 100 ? '...' : '');

      // Delete old content from R2 (asynchronously, don't wait for it)
      if (ctx.waitUntil) {
        ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));
      } else {
        // Fallback if waitUntil is not available
        void deleteContent(env, existingPrompt.contentBlobKey);
      }
    }

    // Update prompt in D1
    await db.update(prompts).set(updateData).where(eq(prompts.id, promptId));

    return { message: 'Prompt updated successfully' };
  });
}

/**
 * Delete a prompt
 * @param env - Environment variables
 * @param promptId - Prompt ID
 * @param userId - User ID
 * @param ctx - Context for waitUntil
 * @returns Delete result
 */
export async function deletePrompt(
  env: WorkerEnv, 
  promptId: string, 
  userId: string, 
  ctx: WorkerContext
): Promise<{ message: string }> {
  return tryCatch(async () => {
    const db = createDb(env.DB);

    // Check if prompt exists and belongs to user
    const [existingPrompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, promptId), eq(prompts.userId, userId)))
      .limit(1);

    if (!existingPrompt) {
      throw createNotFoundError('Prompt', promptId);
    }

    // Get related responses
    const promptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.promptId, promptId));

    // First, delete from database
    // Delete responses first due to foreign key constraints
    if (promptResponses.length > 0) {
      await db.delete(responses).where(eq(responses.promptId, promptId));
    }

    // Delete prompt
    await db.delete(prompts).where(eq(prompts.id, promptId));

    // Delete content from R2 (asynchronously)
    if (ctx.waitUntil) {
      ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));

      // Delete response contents from R2 (asynchronously)
      promptResponses.forEach((response) => {
        ctx.waitUntil!(deleteContent(env, response.contentBlobKey));
      });
    } else {
      // Fallback if waitUntil is not available
      void deleteContent(env, existingPrompt.contentBlobKey);
      
      // Delete response contents asynchronously
      promptResponses.forEach((response) => {
        void deleteContent(env, response.contentBlobKey);
      });
    }

    return { message: 'Prompt deleted successfully' };
  });
}