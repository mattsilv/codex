// Local test backend for development
import http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

// Type definitions
interface User {
  id: string;
  email: string;
  username: string;
  password: string; // In a real app, this would be hashed
  markedForDeletion?: boolean;
  deletedAt?: string;
  createdAt?: string;
}

interface LoginAttempt {
  count: number;
  timestamp: number;
}

interface RateLimitCheck {
  limited: boolean;
  reason?: string;
  timeLeft?: number;
  error?: string;
}

interface LoginAttemptsManager {
  byIP: Map<string, LoginAttempt>;
  byEmail: Map<string, LoginAttempt>;
  isRateLimited(ip: string, email: string): RateLimitCheck;
  recordFailedAttempt(ip: string, email: string): void;
  resetAttempts(ip: string, email: string): void;
}

// Mock users database
const USERS: User[] = [
  {
    id: '1',
    email: 'alice@example.com',
    username: 'alice',
    password: 'password123', // In a real app, this would be hashed
  },
  {
    id: '2',
    email: 'bob@example.com',
    username: 'bob',
    password: 'password123',
  },
];

// Local storage for registered users during the session
const registeredUsers: User[] = [];

// Simple in-memory rate limiting for login attempts
const loginAttempts: LoginAttemptsManager = {
  byIP: new Map<string, LoginAttempt>(),
  byEmail: new Map<string, LoginAttempt>(),

  // Check if rate limited
  isRateLimited(ip: string, email: string): RateLimitCheck {
    const ipAttempts: LoginAttempt = this.byIP.get(ip) || { count: 0, timestamp: Date.now() };
    const emailAttempts: LoginAttempt = this.byEmail.get(email) || {
      count: 0,
      timestamp: Date.now(),
    };

    // Reset counters if older than 15 minutes
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;

    if (ipAttempts.timestamp < fifteenMinutesAgo) {
      ipAttempts.count = 0;
      ipAttempts.timestamp = Date.now();
    }

    if (emailAttempts.timestamp < fifteenMinutesAgo) {
      emailAttempts.count = 0;
      emailAttempts.timestamp = Date.now();
    }

    // Check limits
    if (ipAttempts.count >= 10) {
      const timeLeft = Math.ceil(
        (ipAttempts.timestamp + 15 * 60 * 1000 - Date.now()) / 60000
      );
      return {
        limited: true,
        reason: 'IP',
        timeLeft,
        error: `Too many login attempts from this location. Please try again in ${timeLeft} minutes.`,
      };
    }

    if (emailAttempts.count >= 5) {
      const timeLeft = Math.ceil(
        (emailAttempts.timestamp + 15 * 60 * 1000 - Date.now()) / 60000
      );
      return {
        limited: true,
        reason: 'email',
        timeLeft,
        error: `Too many login attempts for this account. Please try again in ${timeLeft} minutes.`,
      };
    }

    return { limited: false };
  },

  // Record failed attempt
  recordFailedAttempt(ip: string, email: string): void {
    const ipAttempts = this.byIP.get(ip) || { count: 0, timestamp: Date.now() };
    const emailAttempts = this.byEmail.get(email) || {
      count: 0,
      timestamp: Date.now(),
    };

    ipAttempts.count += 1;
    emailAttempts.count += 1;

    // Reset timestamp if this is the first failure
    if (ipAttempts.count === 1) ipAttempts.timestamp = Date.now();
    if (emailAttempts.count === 1) emailAttempts.timestamp = Date.now();

    this.byIP.set(ip, ipAttempts);
    this.byEmail.set(email, emailAttempts);
  },

  // Reset attempts on successful login
  resetAttempts(ip: string, email: string): void {
    this.byIP.set(ip, { count: 0, timestamp: Date.now() });
    this.byEmail.set(email, { count: 0, timestamp: Date.now() });
  },
};

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // TypeScript checks for req.url being defined
  if (!req.url || !req.headers.host) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid request' }));
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  console.log(`${req.method} ${path}`);

  // Parse JSON body
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    // Root API endpoint
    if (path === '/api') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          data: {
            message: 'Local test backend is running',
            environment: 'development',
            version: '1.0.0',
          }
        })
      );
      return;
    }

    // Test endpoint for auth testing
    if (path === '/api/seed-test-data') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'Test users are preloaded',
          users: [
            { email: 'alice@example.com', password: 'password123' },
            { email: 'bob@example.com', password: 'password123' },
          ],
        })
      );
      return;
    }

    // Debug endpoint to view registered users
    if (path === '/api/debug/users' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          registeredCount: registeredUsers.length,
          registeredUsers: registeredUsers.map((u) => ({
            id: u.id,
            email: u.email,
            username: u.username,
            markedForDeletion: u.markedForDeletion || false,
            deletedAt: u.deletedAt || null,
          })),
        })
      );
      return;
    }

    // Login endpoint
    if (path === '/api/auth/login' && req.method === 'POST') {
      try {
        const { email, password } = JSON.parse(body) as { email?: string; password?: string };
        const clientIP =
          (req.headers['x-forwarded-for'] as string) ||
          req.socket.remoteAddress ||
          'unknown';

        // Check required fields
        if (!email || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Email and password are required' }));
          return;
        }

        // Check if rate limited
        const rateLimitCheck = loginAttempts.isRateLimited(clientIP, email);
        if (rateLimitCheck.limited) {
          res.writeHead(429, {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitCheck.timeLeft ? rateLimitCheck.timeLeft * 60 : 900),
          });
          res.end(
            JSON.stringify({
              error: rateLimitCheck.error,
              rateLimited: true,
              timeLeft: rateLimitCheck.timeLeft,
            })
          );
          return;
        }

        // Find user in mock DB
        console.log(`Login attempt: email=${email}, password=${password}`);
        console.log(`Checking against ${USERS.length} predefined users and ${registeredUsers.length} registered users`);
        
        // Debug each user in the test users array
        console.log('DEBUG: Test users:');
        USERS.forEach((u, i) => {
          console.log(`User ${i}:`, JSON.stringify(u));
          console.log(`Match email? ${u.email === email}`);
          console.log(`Match password? ${u.password === password}`);
          console.log(`Match both? ${u.email === email && u.password === password}`);
        });
        
        // For testing, just use hardcoded checks for the test users
        let user = null;
        
        if (email === 'alice@example.com' && password === 'password123') {
          user = {
            id: '1',
            email: 'alice@example.com',
            username: 'alice',
            password: 'password123'
          };
        } else if (email === 'bob@example.com' && password === 'password123') {
          user = {
            id: '2',
            email: 'bob@example.com',
            username: 'bob',
            password: 'password123'
          };
        } else {
          // Fall back to normal user lookup
          user = [...USERS, ...registeredUsers].find(
            (u) => u.email === email && u.password === password
          );
        }
        
        console.log('User found?', user ? 'YES' : 'NO');
        
        if (!user) {
          // Record failed attempt
          loginAttempts.recordFailedAttempt(clientIP, email);

          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: { 
              code: 'UNAUTHORIZED', 
              message: 'Invalid email or password' 
            }
          }));
          return;
        }

        // Reset login attempts on successful login
        loginAttempts.resetAttempts(clientIP, email);

        // Generate mock token
        const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username,
              },
            }
          })
        );
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: { 
            code: 'SERVER_ERROR', 
            message: 'Server error processing login'
          }
        }));
      }
      return;
    }

    // Register endpoint
    if (path === '/api/auth/register' && req.method === 'POST') {
      try {
        const { email, username, password } = JSON.parse(body) as { 
          email?: string; 
          username?: string; 
          password?: string 
        };

        // Check required fields
        if (!email || !username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Email, username, and password are required',
            })
          );
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid email format' }));
          return;
        }

        // Validate username (alphanumeric, 3-20 chars)
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(username)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error:
                'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens',
            })
          );
          return;
        }

        // Validate password complexity
        if (password.length < 8) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: 'Password must be at least 8 characters long',
            })
          );
          return;
        }

        // Check for multiple character types
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);

        const complexityScore = [
          hasLowercase,
          hasUppercase,
          hasNumber,
          hasSpecial,
        ].filter(Boolean).length;

        if (complexityScore < 3) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error:
                'Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, and special characters',
            })
          );
          return;
        }

        // Check if user already exists
        if ([...USERS, ...registeredUsers].some((u) => u.email === email)) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ error: 'User with this email already exists' })
          );
          return;
        }

        // Create user - in a real app, we would hash the password
        const newUser: User = {
          id: `local-${Date.now()}`,
          email,
          username,
          password, // In production, this would be a hashed password
          createdAt: new Date().toISOString(),
        };

        registeredUsers.push(newUser);

        // Generate mock token
        const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            token,
            user: {
              id: newUser.id,
              email: newUser.email,
              username: newUser.username,
            },
          })
        );
      } catch (error) {
        console.error('Registration error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({ error: 'Server error processing registration' })
        );
      }
      return;
    }

    // User profile endpoint
    if (path === '/api/auth/me' && req.method === 'GET') {
      // In a real app, we would validate the token
      const authorization = req.headers.authorization;
      const userId = authorization
        ? authorization.split(' ')[1].split('-')[1]
        : null;

      if (!userId) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Authentication required' }));
        return;
      }

      // This is just a mock implementation
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          id: '1',
          email: 'alice@example.com',
          username: 'alice',
        })
      );
      return;
    }

    // Test user deletion endpoint
    if (path.startsWith('/api/auth/test-delete/') && req.method === 'DELETE') {
      const userId = path.split('/').pop();
      console.log(`Test deletion for user: ${userId}`);

      if (!userId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User ID is required' }));
        return;
      }

      // Find user in our array
      const userIndex = registeredUsers.findIndex((u) => u.id === userId);

      if (userIndex === -1) {
        console.log('User not found in registered users:', userId);
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found', userId }));
        return;
      }

      // Mark user as deleted (in a real app, we'd update the database)
      const user = registeredUsers[userIndex];
      user.markedForDeletion = true;
      user.deletedAt = new Date().toISOString();
      user.email = `deleted_${user.id}@deleted.local`;
      user.username = `deleted_${user.id}`;

      console.log(`User marked for deletion: ${userId}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          success: true,
          message: 'User marked for deletion successfully',
          userId,
          deletedAt: user.deletedAt,
          retentionPeriod: '7 days',
        })
      );
      return;
    }

    // Default 404 response
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: false, 
      error: { 
        code: 'NOT_FOUND', 
        message: 'Resource not found'
      }
    }));
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Local test backend running at http://localhost:${PORT}`);
  console.log('Available test users:');
  USERS.forEach((user) => {
    console.log(`- Email: ${user.email}, Password: ${user.password}`);
  });
  
  // Debug info for login issues
  console.log('\nDEBUG: Full user data:');
  console.log(JSON.stringify(USERS, null, 2));
});