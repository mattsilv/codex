// Simple test script for local backend functionality

import { createDb } from './db/client.js';
import { users, prompts, responses } from './db/schema.js';
import { hashPassword, generateToken } from './utils/auth.js';
import { storeContent, getContent } from './utils/storage.js';
import { seedTestData } from './utils/seedTestData.js';

// Mock environment
const env = {
  DB: {
    prepare: () => ({
      bind: () => ({
        all: () => ([]),
        run: () => ({})
      })
    }),
    batch: (queries) => Promise.resolve([])
  },
  CONTENT_STORE: {
    put: (key, content) => Promise.resolve({}),
    get: (key) => Promise.resolve({
      text: () => Promise.resolve("Test content")
    }),
    delete: (key) => Promise.resolve({})
  },
  ENVIRONMENT: "development"
};

// Test user creation and authentication
async function testAuth() {
  console.log('\n--- Testing Auth Functionality ---');
  
  try {
    const password = await hashPassword('password123');
    console.log('Password hashed successfully');
    
    const user = {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser'
    };
    
    const token = await generateToken(user, env);
    console.log('Token generated:', token);
    
    return { success: true };
  } catch (error) {
    console.error('Auth test failed:', error);
    return { success: false, error };
  }
}

// Test content storage
async function testStorage() {
  console.log('\n--- Testing Storage Functionality ---');
  
  try {
    const key = await storeContent(env.CONTENT_STORE, "This is test content");
    console.log('Content stored with key:', key);
    
    const content = await getContent(env.CONTENT_STORE, key);
    console.log('Retrieved content:', content);
    
    return { success: true };
  } catch (error) {
    console.error('Storage test failed:', error);
    return { success: false, error };
  }
}

// Test database operations
async function testDatabase() {
  console.log('\n--- Testing Database Functionality ---');
  
  try {
    // This is just a test of the structure, not actual DB operations
    // since we're using mock objects
    const db = createDb(env.DB);
    
    console.log('DB schema loaded:', Object.keys(users).length > 0);
    console.log('Users table fields:', Object.keys(users));
    console.log('Prompts table fields:', Object.keys(prompts));
    console.log('Responses table fields:', Object.keys(responses));
    
    return { success: true };
  } catch (error) {
    console.error('Database test failed:', error);
    return { success: false, error };
  }
}

// Test data seeding
async function testSeeding() {
  console.log('\n--- Testing Data Seeding ---');
  
  try {
    const result = await seedTestData(env);
    console.log('Seed result:', result);
    
    return { success: true, result };
  } catch (error) {
    console.error('Seeding test failed:', error);
    return { success: false, error };
  }
}

// Run all tests
async function runTests() {
  console.log('=== STARTING LOCAL BACKEND TESTS ===');
  
  const authResult = await testAuth();
  const storageResult = await testStorage();
  const dbResult = await testDatabase();
  const seedingResult = await testSeeding();
  
  console.log('\n=== TEST RESULTS SUMMARY ===');
  console.log('Auth tests:', authResult.success ? 'PASSED' : 'FAILED');
  console.log('Storage tests:', storageResult.success ? 'PASSED' : 'FAILED');
  console.log('Database tests:', dbResult.success ? 'PASSED' : 'FAILED');
  console.log('Seeding tests:', seedingResult.success ? 'PASSED' : 'FAILED');
  
  console.log('\nTests completed.');
}

runTests().catch(console.error);