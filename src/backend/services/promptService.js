/**
 * Prompt Service Layer
 * Handles business logic for managing prompts
 */

import { createDb } from '../db/client.js';
import { prompts, responses } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { storeContent, getContent, deleteContent } from '../utils/storage.js';
import {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  tryCatch,
} from '../utils/errorHandler.js';

/**
 * Get all prompts for a user
 * @param {Object} env - Environment variables
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of prompts
 */
export async function getUserPrompts(env, userId) {
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
 * @param {Object} env - Environment variables
 * @returns {Promise<Array>} - Array of public prompts
 */
export async function getPublicPrompts(env) {
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
 * @param {Object} env - Environment variables
 * @param {string} userId - User ID
 * @param {Object} promptData - Prompt data
 * @returns {Promise<Object>} - Created prompt
 */
export async function createPrompt(env, userId, promptData) {
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
 * @param {Object} env - Environment variables
 * @param {string} promptId - Prompt ID
 * @param {string} userId - User ID (can be null for public prompts)
 * @returns {Promise<Object>} - Prompt with responses
 */
export async function getPromptById(env, promptId, userId = null) {
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
        return { ...response, content };
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
 * @param {Object} env - Environment variables
 * @param {string} promptId - Prompt ID
 * @param {string} userId - User ID
 * @param {Object} promptData - Updated prompt data
 * @param {Object} ctx - Context for waitUntil
 * @returns {Promise<Object>} - Update result
 */
export async function updatePrompt(env, promptId, userId, promptData, ctx) {
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
    const updateData = {
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
      ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));
    }

    // Update prompt in D1
    await db.update(prompts).set(updateData).where(eq(prompts.id, promptId));

    return { message: 'Prompt updated successfully' };
  });
}

/**
 * Delete a prompt
 * @param {Object} env - Environment variables
 * @param {string} promptId - Prompt ID
 * @param {string} userId - User ID
 * @param {Object} ctx - Context for waitUntil
 * @returns {Promise<Object>} - Delete result
 */
export async function deletePrompt(env, promptId, userId, ctx) {
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
    ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));

    // Delete response contents from R2 (asynchronously)
    promptResponses.forEach((response) => {
      ctx.waitUntil(deleteContent(env, response.contentBlobKey));
    });

    return { message: 'Prompt deleted successfully' };
  });
}
