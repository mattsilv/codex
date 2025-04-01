import { createDb } from '../db/client.js';
import { prompts, responses } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { storeContent, getContent, deleteContent } from '../utils/storage.js';

export async function handleResponseRequest(request, env, ctx) {
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
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
    return new Response(JSON.stringify({ error: 'Prompt not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check if user has access to this prompt
  if (!prompt.isPublic && prompt.userId !== request.user.id) {
    return new Response(
      JSON.stringify({
        error: "You don't have permission to access this prompt",
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
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
    return new Response(JSON.stringify(promptResponses), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create new response for a prompt
  if (!responseId && request.method === 'POST') {
    const { modelName, content, isMarkdown = true } = await request.json();

    if (!modelName || !content) {
      return new Response(
        JSON.stringify({
          error: 'Model name and response content are required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
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
      return new Response(
        JSON.stringify({
          error: `A response with the model "${modelName}" already exists for this prompt`,
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
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

    return new Response(
      JSON.stringify({
        id,
        message: 'Response created successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Get a specific response
  if (responseId && request.method === 'GET') {
    const [responseData] = await db
      .select()
      .from(responses)
      .where(
        and(eq(responses.id, responseId), eq(responses.promptId, promptId))
      )
      .limit(1);

    if (!responseData) {
      return new Response(JSON.stringify({ error: 'Response not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get full content from R2
    const content = await getContent(env, responseData.contentBlobKey);

    return new Response(
      JSON.stringify({
        ...responseData,
        content,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Update a response
  if (responseId && request.method === 'PUT') {
    // First check if the response exists
    const [existingResponse] = await db
      .select()
      .from(responses)
      .where(
        and(eq(responses.id, responseId), eq(responses.promptId, promptId))
      )
      .limit(1);

    if (!existingResponse) {
      return new Response(JSON.stringify({ error: 'Response not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { modelName, content, isMarkdown } = await request.json();
    const updateData = {
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
      ctx.waitUntil(deleteContent(env, existingResponse.contentBlobKey));
    }

    // Update response in D1
    await db
      .update(responses)
      .set(updateData)
      .where(eq(responses.id, responseId));

    return new Response(
      JSON.stringify({ message: 'Response updated successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Delete a response
  if (responseId && request.method === 'DELETE') {
    // First check if the response exists
    const [existingResponse] = await db
      .select()
      .from(responses)
      .where(
        and(eq(responses.id, responseId), eq(responses.promptId, promptId))
      )
      .limit(1);

    if (!existingResponse) {
      return new Response(JSON.stringify({ error: 'Response not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete from D1
    await db.delete(responses).where(eq(responses.id, responseId));

    // Delete content from R2 (asynchronously)
    ctx.waitUntil(deleteContent(env, existingResponse.contentBlobKey));

    return new Response(
      JSON.stringify({ message: 'Response deleted successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
