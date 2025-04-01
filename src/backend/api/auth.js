import { createDb } from '../db/client.js';
import { users, prompts, responses } from '../db/schema.js';
import { eq, and, isNull, not, lt } from 'drizzle-orm';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth.js';
import {
  generateVerificationCode,
  getVerificationCodeExpiry,
  sendVerificationEmail,
} from '../utils/emailService.js';

// Helper function to process user deletion after 7 days
export async function processScheduledUserDeletions(env) {
  try {
    const db = createDb(env.DB);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // Find users marked for deletion whose deletion date is older than 7 days
    const usersToDelete = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.markedForDeletion, true),
          not(isNull(users.deletedAt)),
          lt(users.deletedAt, sevenDaysAgoISO)
        )
      );

    console.log(`Found ${usersToDelete.length} users to permanently delete`);

    // Permanently delete each user's data
    for (const user of usersToDelete) {
      // Delete associated responses
      const userPrompts = await db
        .select()
        .from(prompts)
        .where(eq(prompts.userId, user.id));

      for (const prompt of userPrompts) {
        await db.delete(responses).where(eq(responses.promptId, prompt.id));
      }

      // Delete prompts
      await db.delete(prompts).where(eq(prompts.userId, user.id));

      // Finally delete the user
      await db.delete(users).where(eq(users.id, user.id));

      console.log(`Permanently deleted user ${user.id}`);
    }

    return { success: true, deletedCount: usersToDelete.length };
  } catch (error) {
    console.error('Error in scheduled user deletion:', error);
    return { success: false, error: error.message };
  }
}

export async function handleAuthRequest(request, env, _ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  console.log('Auth API request:', request.method, path);
  console.log('Auth headers:', Object.fromEntries(request.headers.entries()));

  // Direct test-delete endpoint - direct DB access, bypass middleware
  if (
    request.method === 'DELETE' &&
    path.startsWith('/api/auth/test-delete/')
  ) {
    try {
      const userId = path.split('/').pop();
      console.log('Direct deletion test for user ID:', userId);

      const db = createDb(env.DB);

      // Check if user exists
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'User not found', userId }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Mark user for deletion
      const now = new Date().toISOString();
      await db
        .update(users)
        .set({
          markedForDeletion: true,
          deletedAt: now,
          updatedAt: now,
          // Anonymize user data
          email: `deleted_${user.id}@deleted.local`,
          username: `deleted_${user.id}`,
        })
        .where(eq(users.id, userId));

      console.log('User marked for deletion:', userId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'User marked for deletion successfully',
          userId,
          deletedAt: now,
          retentionPeriod: '7 days',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error in test deletion:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Schedule automatic processing of deleted users
  if (request.method === 'GET' && path === '/api/auth/process-deletions') {
    // This would typically be called by a cron job, but we'll expose an endpoint for testing
    // In production, you'd set this up as a scheduled worker
    const result = await processScheduledUserDeletions(env);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Login endpoint
  if (path === '/api/auth/login' && request.method === 'POST') {
    const { email, password } = await request.json();
    const clientIP =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Rate limiting implementation
    // Since Cloudflare Workers doesn't have built-in session storage,
    // we'll use Cloudflare's KV or Durable Objects in production
    // For this implementation, we'll check KV storage if available, or skip rate limiting

    let rateLimiter;
    if (env.KV_RATE_LIMITS) {
      // Use KV if available
      rateLimiter = env.KV_RATE_LIMITS;
    } else {
      // No-op rateLimiter for development/testing
      rateLimiter = {
        get: async () => null,
        put: async () => {},
      };
    }

    // Rate limiting logic
    const ipKey = `login:ip:${clientIP}`;
    const emailKey = `login:email:${email}`;

    try {
      // Get current attempt counts
      const [ipAttempts, emailAttempts] = await Promise.all([
        rateLimiter.get(ipKey),
        rateLimiter.get(emailKey),
      ]);

      const parsedIpAttempts = ipAttempts
        ? JSON.parse(ipAttempts)
        : { count: 0, timestamp: Date.now() };
      const parsedEmailAttempts = emailAttempts
        ? JSON.parse(emailAttempts)
        : { count: 0, timestamp: Date.now() };

      // Check if rate limited
      if (parsedIpAttempts.count >= 10) {
        // 10 attempts per IP in 15 minutes
        const timeLeft = Math.ceil(
          (parsedIpAttempts.timestamp + 15 * 60 * 1000 - Date.now()) / 60000
        );
        return new Response(
          JSON.stringify({
            error: `Too many login attempts from this location. Please try again in ${timeLeft} minutes.`,
            rateLimited: true,
            timeLeft,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(timeLeft * 60),
            },
          }
        );
      }

      if (parsedEmailAttempts.count >= 5) {
        // 5 attempts per email in 15 minutes
        const timeLeft = Math.ceil(
          (parsedEmailAttempts.timestamp + 15 * 60 * 1000 - Date.now()) / 60000
        );
        return new Response(
          JSON.stringify({
            error: `Too many login attempts for this account. Please try again in ${timeLeft} minutes.`,
            rateLimited: true,
            timeLeft,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(timeLeft * 60),
            },
          }
        );
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Continue if rate limiting fails - don't block legitimate login attempts
    }

    const db = createDb(env.DB);
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.markedForDeletion, false) // Don't allow login for deleted users
        )
      )
      .limit(1);

    // Invalid login attempt, update rate limiting counts
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      try {
        // Get current counts again to avoid race conditions
        const [ipAttempts, emailAttempts] = await Promise.all([
          rateLimiter.get(ipKey),
          rateLimiter.get(emailKey),
        ]);

        const parsedIpAttempts = ipAttempts
          ? JSON.parse(ipAttempts)
          : { count: 0, timestamp: Date.now() };
        const parsedEmailAttempts = emailAttempts
          ? JSON.parse(emailAttempts)
          : { count: 0, timestamp: Date.now() };

        // Increment counts
        parsedIpAttempts.count += 1;
        parsedEmailAttempts.count += 1;

        // Reset timestamp if this is the first failure
        if (parsedIpAttempts.count === 1)
          parsedIpAttempts.timestamp = Date.now();
        if (parsedEmailAttempts.count === 1)
          parsedEmailAttempts.timestamp = Date.now();

        // Save updated counts
        await Promise.all([
          rateLimiter.put(ipKey, JSON.stringify(parsedIpAttempts), {
            expirationTtl: 15 * 60,
          }), // 15 minutes
          rateLimiter.put(emailKey, JSON.stringify(parsedEmailAttempts), {
            expirationTtl: 15 * 60,
          }),
        ]);
      } catch (error) {
        console.error('Rate limiting update error:', error);
      }

      return new Response(
        JSON.stringify({ error: 'Invalid email or password' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // If verification code exists and hasn't expired, notify the user they need to verify
      if (user.verificationCode && user.verificationCodeExpiresAt) {
        const now = new Date();
        const expiryDate = new Date(user.verificationCodeExpiresAt);

        if (now < expiryDate) {
          return new Response(
            JSON.stringify({
              error: 'Email not verified',
              requiresVerification: true,
              email: user.email,
              expiresAt: user.verificationCodeExpiresAt,
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        } else {
          // Verification code has expired, generate a new one
          const verificationCode = generateVerificationCode();
          const verificationExpiry = getVerificationCodeExpiry();

          await db
            .update(users)
            .set({
              verificationCode,
              verificationCodeExpiresAt: verificationExpiry,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(users.id, user.id));

          // Send new verification email
          try {
            await sendVerificationEmail(
              env,
              user.email,
              user.username,
              verificationCode
            );
          } catch (emailError) {
            console.error(
              'Failed to send verification email during login:',
              emailError
            );
          }

          return new Response(
            JSON.stringify({
              error: 'Email verification required',
              requiresVerification: true,
              email: user.email,
              message: 'A new verification code has been sent to your email',
              expiresAt: verificationExpiry,
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        // No verification code exists, generate one
        const verificationCode = generateVerificationCode();
        const verificationExpiry = getVerificationCodeExpiry();

        await db
          .update(users)
          .set({
            verificationCode,
            verificationCodeExpiresAt: verificationExpiry,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(users.id, user.id));

        // Send verification email
        try {
          await sendVerificationEmail(
            env,
            user.email,
            user.username,
            verificationCode
          );
        } catch (emailError) {
          console.error(
            'Failed to send verification email during login:',
            emailError
          );
        }

        return new Response(
          JSON.stringify({
            error: 'Email verification required',
            requiresVerification: true,
            email: user.email,
            message: 'A verification code has been sent to your email',
            expiresAt: verificationExpiry,
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Successful login - reset rate limiting
    try {
      await Promise.all([
        rateLimiter.put(
          ipKey,
          JSON.stringify({ count: 0, timestamp: Date.now() }),
          { expirationTtl: 15 * 60 }
        ),
        rateLimiter.put(
          emailKey,
          JSON.stringify({ count: 0, timestamp: Date.now() }),
          { expirationTtl: 15 * 60 }
        ),
      ]);
    } catch (error) {
      console.error('Rate limiting reset error:', error);
    }

    const token = await generateToken(user, env);

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Register endpoint
  if (path === '/api/auth/register' && request.method === 'POST') {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return new Response(
        JSON.stringify({ error: 'Email, username, and password are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // More robust email validation regex
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate username (alphanumeric, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return new Response(
        JSON.stringify({
          error:
            'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate password complexity
    if (password.length < 8) {
      return new Response(
        JSON.stringify({
          error: 'Password must be at least 8 characters long',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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
      return new Response(
        JSON.stringify({
          error:
            'Password must contain at least 3 of the following: lowercase letters, uppercase letters, numbers, and special characters',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const db = createDb(env.DB);

    // Check if user already exists and is not marked for deletion
    const existingUser = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.markedForDeletion, false)))
      .limit(1);

    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create new user with verification code
    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const verificationCode = generateVerificationCode();
    const verificationExpiry = getVerificationCodeExpiry();

    await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
      markedForDeletion: false,
      deletedAt: null,
      verificationCode,
      verificationCodeExpiresAt: verificationExpiry,
      emailVerified: false,
    });

    // Get the newly created user
    const [newUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Send verification email
    try {
      await sendVerificationEmail(env, email, username, verificationCode);
      console.log(
        `Verification email sent to ${email} with code ${verificationCode}`
      );
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    const token = await generateToken(newUser, env);

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          emailVerified: false,
          requiresVerification: true,
        },
        verificationStatus: {
          emailSent: true,
          expiresAt: verificationExpiry,
        },
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Get user profile
  if (path === '/api/auth/me' && request.method === 'GET') {
    // This route requires authentication, which is handled in the main worker
    const userData = {
      id: request.user.id,
      email: request.user.email,
      username: request.user.username,
    };

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update user profile
  if (path === '/api/auth/me' && request.method === 'PUT') {
    const { username, email, password } = await request.json();
    const db = createDb(env.DB);

    // Get current user data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, request.user.id))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
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
    await db.update(users).set(updateData).where(eq(users.id, request.user.id));

    return new Response(
      JSON.stringify({ message: 'Profile updated successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Delete user account (mark for deletion with 7-day retention period)
  if (path === '/api/auth/delete' && request.method === 'DELETE') {
    try {
      console.log('Processing deletion request for user:', request.user);
      console.log('User ID:', request.user?.id);

      const db = createDb(env.DB);

      // Get current user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, request.user.id))
        .limit(1);

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Mark user for deletion
      const now = new Date().toISOString();
      await db
        .update(users)
        .set({
          markedForDeletion: true,
          deletedAt: now,
          updatedAt: now,
          // Anonymize user data
          email: `deleted_${user.id}@deleted.local`,
          username: `deleted_${user.id}`,
          // We keep the password hash since it's not personally identifiable
        })
        .where(eq(users.id, request.user.id));

      return new Response(
        JSON.stringify({
          message:
            'Account scheduled for deletion. Data will be permanently removed after 7 days.',
          retentionPeriodDays: 7,
          scheduleDeletedAt: now,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error in user deletion:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to delete account. Please try again.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Simple direct endpoint for testing user deletion
  // DO NOT USE IN PRODUCTION - FOR TESTING ONLY
  if (
    path.match(/^\/api\/auth\/test-delete\/([^/]+)$/) &&
    request.method === 'DELETE'
  ) {
    try {
      const userId = path.split('/').pop();
      console.log('Direct test delete for user ID:', userId);

      const db = createDb(env.DB);

      // Get current user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Mark user for deletion
      const now = new Date().toISOString();
      await db
        .update(users)
        .set({
          markedForDeletion: true,
          deletedAt: now,
          updatedAt: now,
          // Anonymize user data
          email: `deleted_${user.id}@deleted.local`,
          username: `deleted_${user.id}`,
        })
        .where(eq(users.id, userId));

      return new Response(
        JSON.stringify({
          message:
            'Account directly scheduled for deletion for testing purposes.',
          retentionPeriodDays: 7,
          scheduleDeletedAt: now,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error in test user deletion:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to delete test account: ' + error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Debug endpoint to test authentication
  if (path === '/api/auth/debug' && request.method === 'GET') {
    try {
      return new Response(
        JSON.stringify({
          message: 'Authentication successful',
          user: request.user,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Debug endpoint error: ' + error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Cancel user account deletion (if within the 7-day window)
  if (path === '/api/auth/cancel-deletion' && request.method === 'POST') {
    try {
      const db = createDb(env.DB);
      const { email, password } = await request.json();

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email and password are required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Get deleted user by original email pattern
      const deletedEmailPattern = `deleted_%@deleted.local`;
      const [deletedUser] = await db
        .select()
        .from(users)
        .where(
          and(eq(users.markedForDeletion, true), not(isNull(users.deletedAt)))
        )
        .limit(1);

      if (
        !deletedUser ||
        !(await verifyPassword(password, deletedUser.passwordHash))
      ) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials or account not found' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Restore user
      const now = new Date().toISOString();
      await db
        .update(users)
        .set({
          markedForDeletion: false,
          deletedAt: null,
          updatedAt: now,
          email: email,
          username: email.split('@')[0], // Simple username from email
        })
        .where(eq(users.id, deletedUser.id));

      // Get the restored user
      const [restoredUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, deletedUser.id))
        .limit(1);

      const token = await generateToken(restoredUser, env);

      return new Response(
        JSON.stringify({
          message: 'Account restoration successful',
          token,
          user: {
            id: restoredUser.id,
            email: restoredUser.email,
            username: restoredUser.username,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error in user restoration:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to restore account. Please try again.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Email verification endpoint
  if (path === '/api/auth/verify-email' && request.method === 'POST') {
    try {
      const { email, code } = await request.json();

      if (!email || !code) {
        return new Response(
          JSON.stringify({ error: 'Email and verification code are required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const db = createDb(env.DB);

      // Find user with matching email and verification code
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, email),
            eq(users.verificationCode, code),
            eq(users.emailVerified, false)
          )
        )
        .limit(1);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Invalid verification code' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if code has expired
      const now = new Date();
      const expiryDate = new Date(user.verificationCodeExpiresAt);

      if (now > expiryDate) {
        return new Response(
          JSON.stringify({
            error: 'Verification code has expired',
            expired: true,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Mark email as verified and clear verification code
      await db
        .update(users)
        .set({
          emailVerified: true,
          verificationCode: null,
          verificationCodeExpiresAt: null,
          updatedAt: now.toISOString(),
        })
        .where(eq(users.id, user.id));

      // Generate a new token with updated email verification status
      const token = await generateToken({ ...user, emailVerified: true }, env);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email verified successfully',
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            emailVerified: true,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Email verification error:', error);
      return new Response(JSON.stringify({ error: 'Failed to verify email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Resend verification email endpoint
  if (path === '/api/auth/resend-verification' && request.method === 'POST') {
    try {
      const { email } = await request.json();

      if (!email) {
        return new Response(JSON.stringify({ error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const db = createDb(env.DB);

      // Find user with the given email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Don't reveal if the email exists or not for security
        return new Response(
          JSON.stringify({
            success: true,
            message:
              'If your email is registered, a verification code has been sent',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // If already verified, no need to resend
      if (user.emailVerified) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Email is already verified',
            alreadyVerified: true,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Generate new verification code and update user
      const verificationCode = generateVerificationCode();
      const verificationExpiry = getVerificationCodeExpiry();
      const now = new Date().toISOString();

      await db
        .update(users)
        .set({
          verificationCode,
          verificationCodeExpiresAt: verificationExpiry,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));

      // Send verification email
      await sendVerificationEmail(env, email, user.username, verificationCode);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Verification code has been resent',
          expiresAt: verificationExpiry,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Resend verification error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to resend verification code' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Test endpoint to get verification code for testing
  // DO NOT USE IN PRODUCTION - FOR TESTING ONLY
  if (
    path === '/api/auth/test-get-verification-code' &&
    request.method === 'GET' &&
    env.ENVIRONMENT === 'development'
  ) {
    try {
      const email = url.searchParams.get('email');

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Email parameter is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const db = createDb(env.DB);

      // Find user with the given email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            email: user.email,
            username: user.username,
            verificationCode: user.verificationCode,
            verificationCodeExpiresAt: user.verificationCodeExpiresAt,
            emailVerified: user.emailVerified,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Test get verification code error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get verification code' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return new Response('Not found', { status: 404 });
}
