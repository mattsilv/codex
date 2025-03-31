# CORS Handling

Properly setting up Cross-Origin Resource Sharing (CORS) is crucial for your application, as it enables your frontend to communicate with your backend API securely. Here are best practices for handling CORS in your Cloudflare Workers project:

## CORS Middleware Implementation

Create a CORS middleware that can be used across your application:

```javascript
// src/backend/middleware/cors.js

// Define standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Replace with your frontend domain(s) in production
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
```

## Integration with Main Worker

Incorporate the CORS middleware in your main Worker:

```javascript
// src/backend/index.js
import { handleOptions, addCorsHeaders } from "./middleware/cors";
import { handleAuthRequest } from "./api/auth";
import { handlePromptRequest } from "./api/prompts";
import { handleResponseRequest } from "./api/responses";

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Authentication middleware
    if (
      path.startsWith("/api/") &&
      path !== "/api/auth/login" &&
      path !== "/api/auth/register"
    ) {
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
    }

    // Route to appropriate handler
    let response;
    try {
      if (path.startsWith("/api/auth/")) {
        response = await handleAuthRequest(request, env, ctx);
      } else if (path.startsWith("/api/prompts")) {
        if (path.includes("/responses")) {
          response = await handleResponseRequest(request, env, ctx);
        } else {
          response = await handlePromptRequest(request, env, ctx);
        }
      } else {
        // Serve static assets for frontend
        response = await env.ASSETS.fetch(request);
      }

      // Add CORS headers to the response
      return addCorsHeaders(response);
    } catch (error) {
      // Handle any errors and add CORS headers
      return addCorsHeaders(
        new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );
    }
  },
};
```

## Best Practices for CORS in Production

1. **Restrict Origins**: In production, replace `'*'` with your specific frontend domain(s):

   ```javascript
   const corsHeaders = {
     "Access-Control-Allow-Origin": "https://your-app-domain.com",
     // Other headers...
   };
   ```

2. **For multiple allowed origins**, implement a check against an allowlist:

   ```javascript
   const allowedOrigins = [
     "https://your-app-domain.com",
     "https://staging-app-domain.com",
     "http://localhost:3000",
   ];

   function handleCors(request, response) {
     const origin = request.headers.get("Origin");
     if (origin && allowedOrigins.includes(origin)) {
       response.headers.set("Access-Control-Allow-Origin", origin);
     }
     return response;
   }
   ```

3. **Limit Exposed Headers**: Only expose headers that your frontend needs:

   ```javascript
   corsHeaders["Access-Control-Expose-Headers"] =
     "Content-Length, Content-Type";
   ```

4. **Credentials Support**: If your frontend uses credentials (cookies, HTTP authentication), configure CORS accordingly:

   ```javascript
   corsHeaders["Access-Control-Allow-Credentials"] = "true";
   ```

   Note: When using credentials, you cannot use `'*'` for `Access-Control-Allow-Origin`. You must specify the exact origin.

5. **Dynamic CORS Based on Environment**:

   ```javascript
   // Read environment from Cloudflare environment variables
   const environment = env.ENVIRONMENT || "development";

   let allowedOrigins;
   if (environment === "production") {
     allowedOrigins = ["https://your-app-domain.com"];
   } else if (environment === "staging") {
     allowedOrigins = ["https://staging-app-domain.com"];
   } else {
     allowedOrigins = ["http://localhost:3000"];
   }
   ```

## CORS with R2 Storage

If your application serves files directly from R2 buckets, you'll need to configure CORS for those buckets as well:

1. Log in to the Cloudflare dashboard
2. Navigate to R2 > Your Bucket > Settings
3. Under CORS Policy, add a policy with the appropriate configuration:

```json
{
  "AllowedOrigins": ["https://your-app-domain.com"],
  "AllowedMethods": ["GET"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["Content-Length", "Content-Type"],
  "MaxAgeSeconds": 86400
}
```

## Testing CORS Configuration

During development, use browser developer tools to verify CORS is working correctly:

1. Open the Network tab in your browser's developer tools
2. Make a request from your frontend to your API
3. Check that the response includes the correct CORS headers
4. If CORS issues occur, check the console for specific error messages

By implementing these CORS practices, your application will securely handle cross-origin requests while maintaining proper security boundaries.# LLM Prompt Tracker MVP - Developer Guide

## Overview

This document provides implementation guidelines for the LLM Prompt Tracker MVP, a web application for collecting, storing, and comparing responses from different Large Language Models (LLMs) to the same prompts. The application will allow users to save prompts, add multiple responses from different LLMs, and optionally share their collections publicly.

## Technology Stack

### Frontend

- **Framework**: Preact (lightweight React alternative)
- **CSS Framework**: PicoCSS (classless, minimal-decision framework)
- **Routing**: Preact Router
- **State Management**: Preact Context API

### Backend

- **API**: Cloudflare Workers (serverless functions)
- **Authentication**: JWT token-based auth
- **Database**: Cloudflare D1 (for metadata) + R2 (for content storage)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Deployment**: Cloudflare Pages for hosting and Workers for serverless functions

## Project Structure

We'll use a monorepo structure where the frontend and backend are in the same project directory but separated into different folders:

```
prompt-tracker/
├── package.json            # Root package.json for shared dependencies
├── wrangler.toml           # Cloudflare configuration
├── src/
│   ├── frontend/           # Frontend code
│   │   ├── components/     # Preact components
│   │   │   ├── layout/     # Layout components (Header, Footer)
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── prompt/     # Prompt-related components
│   │   │   ├── response/   # Response-related components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Frontend utilities
│   │   ├── context/        # Context providers
│   │   ├── styles/         # CSS files
│   │   └── index.jsx       # Frontend entry point
│   ├── backend/            # Backend code (Workers)
│   │   ├── api/            # API endpoints
│   │   │   ├── auth.js     # Authentication endpoints
│   │   │   ├── prompts.js  # Prompt endpoints
│   │   │   └── responses.js # Response endpoints
│   │   ├── models/         # Data models
│   │   ├── utils/          # Backend utilities
│   │   │   ├── auth.js     # Authentication utilities
│   │   │   ├── storage.js  # Storage utilities (R2 + D1)
│   │   │   └── validation.js # Input validation
│   │   └── index.js        # Main Worker entry point
│   └── shared/             # Shared code between frontend and backend
│       ├── constants.js    # Shared constants
│       ├── types.js        # Type definitions
│       └── utils.js        # Shared utility functions
├── public/                 # Static assets
├── migrations/             # D1 database migrations
└── scripts/                # Build and deployment scripts
```

## Data Model

We'll use a dual-storage approach, with metadata in D1 and content in R2, to optimize cost and performance:

### D1 Database Schema

```sql
-- migrations/0000_initial_schema.sql
CREATE TABLE Users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE Prompts (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT,
  contentPreview TEXT NOT NULL,
  contentBlobKey TEXT NOT NULL,
  isPublic INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  tags TEXT,
  FOREIGN KEY (userId) REFERENCES Users(id)
);

CREATE TABLE Responses (
  id TEXT PRIMARY KEY,
  promptId TEXT NOT NULL,
  modelName TEXT NOT NULL,
  contentPreview TEXT NOT NULL,
  contentBlobKey TEXT NOT NULL,
  isMarkdown INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (promptId) REFERENCES Prompts(id)
);

-- Create indexes for common queries
CREATE INDEX idx_prompts_userId ON Prompts(userId);
CREATE INDEX idx_responses_promptId ON Responses(promptId);
```

### R2 Storage Structure

Content will be stored in R2 with the following key structure:

- Prompts: `prompt_[timestamp]_[random]`
- Responses: `response_[timestamp]_[random]`

## Setup Instructions

### Prerequisites

- Node.js v16.17.0 or later
- npm or yarn
- Cloudflare account

### Project Initialization

1. Install Wrangler v3:

```bash
npm install -g wrangler@3
```

2. Create a new project:

```bash
npm create cloudflare@latest prompt-tracker -- --type="webpack"
cd prompt-tracker
```

3. Install required dependencies:

```bash
# Frontend dependencies
npm install preact preact-router @picocss/pico jwt-decode

# Backend dependencies
npm install drizzle-orm

# Dev dependencies
npm install --save-dev @preact/preset-vite drizzle-kit
```

### Cloudflare Resources Setup

1. Create a D1 database:

```bash
npx wrangler d1 create prompt-tracker-db --location=wnam
```

2. Create an R2 bucket:

```bash
npx wrangler r2 bucket create prompt-tracker-content
```

3. Update your wrangler.toml with the database and bucket information:

```toml
# wrangler.toml
name = "prompt-tracker"
compatibility_date = "2025-03-30"

# D1 Database configuration
[[d1_databases]]
binding = "DB"
database_name = "prompt_tracker_db"
database_id = "YOUR_DATABASE_ID" # Replace with actual ID from step 1

# R2 Bucket configuration
[[r2_buckets]]
binding = "CONTENT_STORE"
bucket_name = "prompt-tracker-content"
```

4. Create initial database schema:

```bash
mkdir -p migrations
```

Create a file named `migrations/0000_initial_schema.sql` with the schema from the "D1 Database Schema" section above.

5. Apply the migration:

```bash
npx wrangler d1 migrations apply prompt-tracker-db
```

## Implementation Guide

### ORM and Database Migration Strategy

For the LLM Prompt Tracker MVP, we'll use Drizzle ORM with Cloudflare D1. Drizzle ORM is a JavaScript ORM with a CLI companion (drizzle-kit) for automatic SQL migrations generation and has first-class support for Cloudflare D1.

## Setup Drizzle ORM

1. Install Drizzle and its D1 adapter:

```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

2. Create a schema directory and define your database schema:

```javascript
// src/backend/db/schema.js
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title"),
  contentPreview: text("content_preview").notNull(),
  contentBlobKey: text("content_blob_key").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  tags: text("tags"),
});

export const responses = sqliteTable("responses", {
  id: text("id").primaryKey(),
  promptId: text("prompt_id")
    .notNull()
    .references(() => prompts.id),
  modelName: text("model_name").notNull(),
  contentPreview: text("content_preview").notNull(),
  contentBlobKey: text("content_blob_key").notNull(),
  isMarkdown: integer("is_markdown", { mode: "boolean" })
    .notNull()
    .default(true),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});
```

3. Create a configuration file for Drizzle:

```javascript
// drizzle.config.js
export default {
  schema: "./src/backend/db/schema.js",
  out: "./migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: "./.wrangler/state/d1/DB/db.sqlite",
  },
};
```

## Database Migration Workflow

To generate a migration using Drizzle Kit, run the drizzle-kit generate:sqlite command since Cloudflare D1 uses SQLite. The Cloudflare D1 migration tool requires migration files to be stored in ./migrations/.

Here's the workflow for managing migrations:

1. Create initial schema or make changes to your schema in `schema.js`
2. Generate migration files:

```bash
npx drizzle-kit generate:sqlite
```

3. Apply migrations to local D1 for development:

```bash
npx wrangler d1 migrations apply prompt-tracker-db --local
```

4. Apply migrations to production D1:

```bash
npx wrangler d1 migrations apply prompt-tracker-db --remote
```

## Database Client Setup

Create a database client utility to handle connections to D1:

```javascript
// src/backend/db/client.js
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1Database) {
  return drizzle(d1Database, { schema });
}
```

## Example Usage in API

```javascript
// src/backend/api/prompts.js
import { createDb } from "../db/client";
import { prompts } from "../db/schema";
import { eq } from "drizzle-orm";
import { storeContent, getContent } from "../utils/storage";

export async function handlePromptRequest(request, env, ctx) {
  const db = createDb(env.DB);

  const url = new URL(request.url);
  const path = url.pathname;

  // Get all prompts for a user
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

  // Other handlers...
}
```

# Storage Utilities

Create a storage utility to handle content storage in R2:

```javascript
// src/backend/utils/storage.js
export async function storeContent(env, content, prefix = "prompt") {
  const key = `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  // Store content in R2
  await env.CONTENT_STORE.put(key, content);

  return key;
}

export async function getContent(env, key) {
  // Retrieve content from R2
  const object = await env.CONTENT_STORE.get(key);

  if (object === null) {
    throw new Error("Content not found");
  }

  return object.text();
}
```

### API Implementation

Here's an example of how to implement the prompts API using Drizzle ORM:

```javascript
// src/backend/api/prompts.js
import { createDb } from "../db/client";
import { prompts, responses } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { storeContent, getContent } from "../utils/storage";

export async function handlePromptRequest(request, env, ctx) {
  const db = createDb(env.DB);
  const url = new URL(request.url);
  const path = url.pathname;
  const id = path.match(/\/api\/prompts\/([^\/]+)/)?.[1];

  // List prompts
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

  // Create prompt
  if (path === "/api/prompts" && request.method === "POST") {
    const { title, content, isPublic, tags } = await request.json();

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
      tags: JSON.stringify(tags || []),
    });

    return new Response(JSON.stringify({ id: promptId }), {
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response("Prompt not found", { status: 404 });
    }

    // Check access permissions
    if (!prompt.isPublic && prompt.userId !== request.user?.id) {
      return new Response("Unauthorized", { status: 403 });
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

  return new Response("Not found", { status: 404 });
}
```

### Main Worker Entry Point

```javascript
// src/backend/index.js
import { handleAuthRequest } from "./api/auth";
import { handlePromptRequest } from "./api/prompts";
import { handleResponseRequest } from "./api/responses";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS handling
    if (request.method === "OPTIONS") {
      return handleCors(request);
    }

    // Authentication middleware
    if (
      path.startsWith("/api/") &&
      path !== "/api/auth/login" &&
      path !== "/api/auth/register"
    ) {
      try {
        request = await authenticateRequest(request, env);
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Route to appropriate handler
    if (path.startsWith("/api/auth/")) {
      return handleAuthRequest(request, env, ctx);
    }

    if (path.startsWith("/api/prompts")) {
      if (path.includes("/responses")) {
        return handleResponseRequest(request, env, ctx);
      }
      return handlePromptRequest(request, env, ctx);
    }

    // Serve static assets for frontend
    return env.ASSETS.fetch(request);
  },
};

// Helper functions
async function authenticateRequest(request, env) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }

  const token = authHeader.split(" ")[1];
  // Implement JWT validation here

  return request;
}

function handleCors(request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
```

### Frontend Components Example

Here's an example of a prompt creation form:

```jsx
// src/frontend/components/prompt/PromptForm.jsx
import { useState } from "preact/hooks";

export default function PromptForm({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ title, content, isPublic });
      // Reset form
      setTitle("");
      setContent("");
      setIsPublic(false);
    } catch (error) {
      console.error("Error creating prompt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid">
        <label for="title">
          Title (optional)
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your prompt a title"
          />
        </label>
      </div>

      <div className="grid">
        <label for="content">
          Prompt Content
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your prompt here"
            required
            rows={5}
          />
        </label>
      </div>

      <div className="grid">
        <label for="isPublic" className="checkbox-label">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Make this prompt public (shareable)
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Prompt"}
      </button>
    </form>
  );
}
```

## Local Development

You can use Wrangler v3's local development capabilities to test both the frontend and backend together:

```bash
# Start local development server
npx wrangler dev --local --persist
```

This will:

- Start a local server with Workers runtime
- Persist your local D1 data between sessions
- Use a local version of your R2 bucket

## Deployment

To deploy your application:

1. First, deploy your Worker:

```bash
npx wrangler deploy
```

2. Then, deploy your frontend to Cloudflare Pages:

```bash
# Build frontend
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist
```

3. Configure your Pages project to use your Worker as a Functions service by adding the appropriate `_routes.json` file.

## Advanced Features (For Future Implementation)

These features can be added after the MVP is successful:

1. Collections and folders for organizing prompts
2. Analytics on prompts/responses
3. Advanced sharing functionality
4. Model categorization and filtering
5. Collaboration features
6. Export/import functionality

## Best Practices

1. **Error Handling**: Implement consistent error handling across both frontend and backend
2. **Validation**: Validate all inputs on both client and server
3. **Caching**: Leverage Cloudflare's caching for improved performance
4. **Testing**: Write tests for critical paths using Miniflare
5. **Security**: Implement proper authentication and authorization checks
6. **Backups**: Regularly back up your D1 database using Wrangler
7. **Database Migrations**:
   - Keep migration files in source control
   - Test migrations locally before applying to production
   - Create small, targeted migrations rather than large schema changes
8. **ORM Usage**:
   - Use the ORM for data access but don't be afraid to use raw SQL for complex queries
   - Leverage TypeScript for type safety with your database operations

## Troubleshooting

- If you encounter issues with local development, clear your local state with `rm -rf .wrangler`
- For R2 permission issues, check your bucket permissions in the Cloudflare dashboard
- If you get JWT validation errors, verify your JWT secret is correctly configured
- If you encounter migration issues:
  - Verify your migration files are in the correct format
  - Try running migrations with the `--verbose` flag to get more detailed error information
  - Check that your local schema matches your Drizzle schema definition
- For ORM-related issues:
  - Double-check your schema definitions match your migration files
  - Ensure your Drizzle client is correctly initialized with your D1 instance
  - Use the debug mode in Drizzle to see the generated SQL queries
