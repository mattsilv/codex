import { createDb } from "../db/client";
import { prompts, responses } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { storeContent, getContent, deleteContent } from "../utils/storage";

export async function handlePromptRequest(request, env, ctx) {
  const db = createDb(env.DB);
  const url = new URL(request.url);
  const path = url.pathname;
  const id = path.match(/\/api\/prompts\/([^\/]+)/)?.[1];

  // List prompts for user
  if (path === "/api/prompts" && request.method === "GET") {
    const userPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.userId, request.user.id))
      .orderBy(prompts.updatedAt);

    return new Response(JSON.stringify(userPrompts), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Create new prompt
  if (path === "/api/prompts" && request.method === "POST") {
    const { title, content, isPublic, tags } = await request.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Prompt content is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Store full content in R2
    const contentBlobKey = await storeContent(env, content, "prompt");

    // Store metadata in D1
    const contentPreview =
      content.substring(0, 100) + (content.length > 100 ? "..." : "");
    const promptId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(prompts).values({
      id: promptId,
      userId: request.user.id,
      title: title || "",
      contentPreview,
      contentBlobKey,
      isPublic: !!isPublic,
      createdAt: now,
      updatedAt: now,
      tags: tags ? JSON.stringify(tags) : null,
    });

    return new Response(
      JSON.stringify({ 
        id: promptId,
        message: "Prompt created successfully" 
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Get single prompt with responses
  if (id && request.method === "GET") {
    // Get prompt metadata from D1
    const [prompt] = await db
      .select()
      .from(prompts)
      .where(eq(prompts.id, id))
      .limit(1);

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt not found" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check access permissions
    if (!prompt.isPublic && prompt.userId !== request.user?.id) {
      return new Response(
        JSON.stringify({ error: "You don't have permission to access this prompt" }),
        { 
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get full content from R2
    const content = await getContent(env, prompt.contentBlobKey);

    // Get responses from D1
    const promptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.promptId, id))
      .orderBy(responses.createdAt);

    // Fetch full response contents from R2
    const responsesWithContent = await Promise.all(
      promptResponses.map(async (response) => {
        const content = await getContent(env, response.contentBlobKey);
        return { ...response, content };
      })
    );

    return new Response(
      JSON.stringify({
        ...prompt,
        content,
        responses: responsesWithContent,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Update prompt
  if (id && request.method === "PUT") {
    // Check if prompt exists and belongs to user
    const [existingPrompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, id), eq(prompts.userId, request.user.id)))
      .limit(1);

    if (!existingPrompt) {
      return new Response(
        JSON.stringify({ error: "Prompt not found or you don't have permission to update it" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { title, content, isPublic, tags } = await request.json();
    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);

    // If content is updated, store it in R2 and update the key
    if (content) {
      // Store new content in R2
      const contentBlobKey = await storeContent(env, content, "prompt");
      updateData.contentBlobKey = contentBlobKey;
      updateData.contentPreview = content.substring(0, 100) + (content.length > 100 ? "..." : "");
      
      // Delete old content from R2 (asynchronously, don't wait for it)
      ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));
    }

    // Update prompt in D1
    await db
      .update(prompts)
      .set(updateData)
      .where(eq(prompts.id, id));

    return new Response(
      JSON.stringify({ message: "Prompt updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Delete prompt
  if (id && request.method === "DELETE") {
    // Check if prompt exists and belongs to user
    const [existingPrompt] = await db
      .select()
      .from(prompts)
      .where(and(eq(prompts.id, id), eq(prompts.userId, request.user.id)))
      .limit(1);

    if (!existingPrompt) {
      return new Response(
        JSON.stringify({ error: "Prompt not found or you don't have permission to delete it" }),
        { 
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get related responses
    const promptResponses = await db
      .select()
      .from(responses)
      .where(eq(responses.promptId, id));

    // First, delete from database
    // Delete responses first due to foreign key constraints
    if (promptResponses.length > 0) {
      await db.delete(responses).where(eq(responses.promptId, id));
    }

    // Delete prompt
    await db.delete(prompts).where(eq(prompts.id, id));

    // Delete content from R2 (asynchronously)
    ctx.waitUntil(deleteContent(env, existingPrompt.contentBlobKey));

    // Delete response contents from R2 (asynchronously)
    promptResponses.forEach((response) => {
      ctx.waitUntil(deleteContent(env, response.contentBlobKey));
    });

    return new Response(
      JSON.stringify({ message: "Prompt deleted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({ error: "Not found" }),
    { 
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
}