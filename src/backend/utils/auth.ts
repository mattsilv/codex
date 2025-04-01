/**
 * Authentication utilities for Cloudflare Workers environment
 * Uses Web Crypto API instead of Node.js-specific modules
 */

/**
 * User data structure for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/**
 * JWT token response
 */
export interface TokenResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Simple password hashing using Web Crypto API
 * This is a replacement for bcryptjs which isn't compatible with Cloudflare Workers
 *
 * @param password - The password to hash
 * @returns Base64 encoded hash
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, you would use a better algorithm and salt
  // For development/testing, we're using a simple hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // Convert to Base64
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  return hashBase64;
}

/**
 * Verify a password against a stored hash
 *
 * @param password - The plain text password to check
 * @param storedHash - The stored password hash
 * @returns boolean indicating if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === storedHash;
}

/**
 * Generate a JWT token for authentication
 *
 * @param user - The user to generate a token for
 * @param secret - Secret key for signing the token
 * @returns JWT token string
 */
export function generateToken(
  user: User,
  secret: string = 'dev-secret-key'
): string {
  // Create JWT payload
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };

  // In production, use a proper JWT library
  // For now, we're using a simple Base64 encoding
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(secret + encodedPayload); // Simple signature

  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a JWT token
 *
 * @param token - The JWT token to verify
 * @param secret - Secret key for verifying the token
 * @returns The decoded payload or null if invalid
 */
export function verifyToken(
  token: string,
  secret: string = 'dev-secret-key'
): JwtPayload | null {
  try {
    const [encodedPayload, signature] = token.split('.');

    // Verify signature
    const expectedSignature = btoa(secret + encodedPayload);
    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(atob(encodedPayload)) as JwtPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Extracts the Bearer token from the Authorization header and verifies it.
 * Throws an error if authentication fails.
 *
 * @param request The incoming Request object.
 * @param env The environment object containing secrets.
 * @returns The authenticated Request object with user payload attached.
 */
export async function authenticateRequest(
  request: Request,
  env: { AUTH_SECRET?: string }
): Promise<Request> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header'); // Consider using ApiError here
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  const secret = env.AUTH_SECRET || 'dev-secret-key'; // Use env secret or fallback

  const payload = verifyToken(token, secret);
  if (!payload) {
    throw new Error('Invalid or expired token'); // Consider using ApiError here
  }

  // Attach user payload to the request object for downstream use
  // Note: Modifying the Request object might not be the best practice.
  // Consider alternative ways to pass user context if needed.
  (request as any).user = payload;

  return request;
}
