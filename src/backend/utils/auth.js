import { createDb } from "../db/client.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// In a production app, you would use a real JWT implementation
// This is a simplified version for our MVP
export async function generateToken(user, env) {
  // Create a simple encoded token with expiration
  const payload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  
  // In production, this would use JWT and a secure signing method
  const token = btoa(JSON.stringify(payload));
  return token;
}

export async function verifyToken(token, env) {
  try {
    // Decode the token
    const payload = JSON.parse(atob(token));
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }
    
    // In a real app, we would verify the signature here
    
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function authenticateRequest(request, env) {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid authorization header");
  }
  
  const token = authHeader.split(" ")[1];
  const payload = await verifyToken(token, env);
  
  // Get user from database
  const db = createDb(env.DB);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Attach user to request object
  const newRequest = new Request(request);
  newRequest.user = {
    id: user.id,
    email: user.email,
    username: user.username
  };
  
  return newRequest;
}

export async function hashPassword(password) {
  // In production, use bcrypt or similar
  // For MVP simplicity, we're using a simple hash
  return btoa(password);
}

export async function verifyPassword(password, hash) {
  return btoa(password) === hash;
}