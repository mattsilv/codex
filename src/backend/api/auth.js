import { createDb } from "../db/client";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashPassword, verifyPassword } from "../utils/auth";

export async function handleAuthRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Login endpoint
  if (path === "/api/auth/login" && request.method === "POST") {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const db = createDb(env.DB);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const token = await generateToken(user, env);
    
    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Register endpoint
  if (path === "/api/auth/register" && request.method === "POST") {
    const { email, username, password } = await request.json();
    
    if (!email || !username || !password) {
      return new Response(
        JSON.stringify({ error: "Email, username, and password are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const db = createDb(env.DB);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: "User with this email already exists" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Create new user
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    
    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    
    // Get the newly created user
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    const token = await generateToken(newUser, env);
    
    return new Response(
      JSON.stringify({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Get user profile
  if (path === "/api/auth/me" && request.method === "GET") {
    // This route requires authentication, which is handled in the main worker
    const userData = {
      id: request.user.id,
      email: request.user.email,
      username: request.user.username,
    };
    
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  
  // Update user profile
  if (path === "/api/auth/me" && request.method === "PUT") {
    const { username, email, password } = await request.json();
    const db = createDb(env.DB);
    
    // Get current user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.user.id))
      .limit(1);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Prepare update data
    const updateData = {
      updatedAt: new Date().toISOString(),
    };
    
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.passwordHash = await hashPassword(password);
    
    // Update user
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, request.user.id));
    
    return new Response(
      JSON.stringify({ message: "Profile updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  return new Response("Not found", { status: 404 });
}