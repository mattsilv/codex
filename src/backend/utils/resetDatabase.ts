/**
 * resetDatabase.ts - Utility for resetting and reseeding the database (DEV ONLY!)
 */

import { createDb } from '../db/client.ts';
import { users, prompts, responses } from '../db/schema.ts';
import { hashPassword } from './auth.ts';
import { seedTestData } from './seedTestData.ts';

/**
 * Interface for environment variables and bindings
 */
export interface ResetDbEnv {
  DB?: unknown;
  CONTENT_STORE?: {
    put: (key: string, value: string, options?: any) => Promise<any>;
    get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
    delete: (key: string) => Promise<void>;
    list: (options?: { prefix?: string }) => Promise<{ keys: Array<{ name: string }> }>;
  };
  JWT_SECRET?: string;
  [key: string]: unknown;
}

/**
 * Resets the database by dropping all tables and recreating them
 * FOR DEVELOPMENT USE ONLY!
 */
export async function resetDatabase(env: ResetDbEnv, adminKey?: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  // Verify admin key (basic protection)
  if (adminKey !== 'dev-mode-reset') {
    return {
      success: false,
      message: 'Unauthorized',
      error: 'Invalid admin key'
    };
  }

  try {
    console.log('[DEV ONLY] Resetting database...');
    
    // Check if DB is available
    if (!env.DB) {
      console.error('Database connection not available');
      return { success: false, message: 'Database connection not available' };
    }

    // Create DB instance
    const db = createDb(env.DB);

    // First delete all data from all tables
    console.log('Deleting existing data...');
    
    try {
      // Delete in reverse order of dependencies
      await db.delete(responses);
      await db.delete(prompts);
      await db.delete(users);
      console.log('All tables cleared successfully');
    } catch (deleteError) {
      console.error('Error deleting data:', deleteError);
      return { 
        success: false, 
        message: 'Failed to delete existing data',
        error: deleteError instanceof Error ? deleteError.message : String(deleteError)
      };
    }

    // Clean up any blob storage if available
    if (env.CONTENT_STORE) {
      console.log('Cleaning blob storage...');
      try {
        // List all keys
        const promptKeys = await env.CONTENT_STORE.list({ prefix: 'prompt_' });
        const responseKeys = await env.CONTENT_STORE.list({ prefix: 'response_' });
        
        // Delete all prompt blobs
        for (const key of promptKeys.keys) {
          await env.CONTENT_STORE.delete(key.name);
        }
        
        // Delete all response blobs
        for (const key of responseKeys.keys) {
          await env.CONTENT_STORE.delete(key.name);
        }
        
        console.log('Blob storage cleaned');
      } catch (blobError) {
        console.error('Error cleaning blob storage:', blobError);
        // Continue even if blob cleanup fails
      }
    }

    // Add a simple test user for easy testing (without prompts/responses)
    console.log('Adding test user alice@example.com/password123...');
    const passwordHash = await hashPassword('password123');
    
    // Create test user without foreign key dependencies
    const testUser = {
      id: 'test-alice-001',
      email: 'alice@example.com',
      username: 'alice',
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      markedForDeletion: false,
      deletedAt: null,
      verificationCode: null,
      verificationCodeExpiresAt: null
    };
    
    try {
      // Insert the test user
      await db.insert(users).values(testUser);
      console.log('Test user created successfully');
    } catch (userError) {
      console.error('Error creating test user:', userError);
      return {
        success: false,
        message: 'Failed to create test user',
        error: userError instanceof Error ? userError.message : String(userError)
      };
    }
    
    // Now seed additional test data (prompts and responses)
    console.log('Seeding additional test data...');
    const seedResult = await seedTestData(env);
    
    if (!seedResult.success) {
      // Continue even if seeding additional data fails - we already have our basic test user
      console.warn('Warning: Failed to seed additional test data:', seedResult.message);
      // Return success anyway since the main test user was created
      return {
        success: true,
        message: 'Database reset with basic test user created (additional data seeding failed)',
      };
    }

    return {
      success: true,
      message: 'Database reset and seeded with fresh test data'
    };
  } catch (error) {
    console.error('Reset database error:', error);
    return {
      success: false,
      message: 'Database reset failed',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}