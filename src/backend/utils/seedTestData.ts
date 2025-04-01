import { eq } from 'drizzle-orm';
import { createDb } from '../db/client.ts';
import { users, prompts, responses } from '../db/schema.ts';
import { generateToken, hashPassword } from './auth.ts';
import { ApiError } from './errorHandler.ts';

/**
 * Interface for environment variables and bindings
 */
export interface SeedDataEnv {
  DB?: unknown;
  CONTENT_STORE?: {
    put: (key: string, value: string, options?: any) => Promise<any>;
    get: (key: string) => Promise<{ text: () => Promise<string> } | null>;
    delete: (key: string) => Promise<void>;
  };
  JWT_SECRET?: string;
  [key: string]: unknown;
}

/**
 * Interface for test user data
 */
interface TestUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

/**
 * Interface for test prompt data
 */
interface TestPrompt {
  id: string;
  userId: string;
  title: string;
  contentPreview: string;
  contentBlobKey: string;
  isPublic: boolean;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for test response data
 */
interface TestResponse {
  id: string;
  promptId: string;
  contentPreview: string;
  contentBlobKey: string;
  modelName: string;
  isMarkdown: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for seed result
 */
interface SeedResult {
  success: boolean;
  message: string;
  testUsers?: {
    alice: TestUser & { token: string };
    bob: TestUser & { token: string };
  };
}

/**
 * Seeds the database with test data for development and testing
 * Using simplified hash functions for Cloudflare Workers environment
 */
export async function seedTestData(env: SeedDataEnv): Promise<SeedResult> {
  try {
    console.log('Seeding test data...');

    // Check if DB is available
    if (!env.DB) {
      console.error('Database connection not available');
      return { success: false, message: 'Database connection not available' };
    }

    // Create DB instance
    const db = createDb(env.DB);

    // Create test user data using our simplified hash function
    const passwordHash = await hashPassword('password123');

    let testUsers: TestUser[] = [
      {
        id: crypto.randomUUID(),
        email: 'alice@example.com',
        username: 'alice',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
      },
      {
        id: crypto.randomUUID(),
        email: 'bob@example.com',
        username: 'bob',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: true,
      },
    ];

    // Check if we already have users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Users already exist. Using existing alice user for test data.');
      
      // Find alice user to get the ID
      const { eq } = await import('drizzle-orm');
      const aliceUser = await db
        .select()
        .from(users)
        .where(eq(users.email, 'alice@example.com'))
        .limit(1);
        
      if (aliceUser.length === 0) {
        console.log('Test user alice@example.com not found. Creating new test data with random users.');
        await db.insert(users).values(testUsers);
        console.log('Created test users');
      } else {
        console.log('Using existing alice user for test data:', aliceUser[0].id);
        // Use the existing alice ID for test data
        testUsers[0].id = aliceUser[0].id;
        
        // Check if Bob exists too
        const bobUser = await db
          .select()
          .from(users)
          .where(eq(users.email, 'bob@example.com'))
          .limit(1);
          
        if (bobUser.length === 0) {
          // Only insert Bob
          await db.insert(users).values([testUsers[1]]);
          console.log('Created bob test user');
        } else {
          // Use existing Bob ID too
          testUsers[1].id = bobUser[0].id;
          console.log('Using existing bob user for test data:', bobUser[0].id);
        }
      }
    } else {
      // No existing users, insert both test users
      await db.insert(users).values(testUsers);
      console.log('Created test users');
    }

    // Clean up existing prompts and responses if any
    try {
      console.log('Removing any existing prompts and responses...');
      await db.delete(responses);
      await db.delete(prompts);
    } catch (error) {
      console.warn('Error deleting existing prompts and responses:', error);
      // Continue despite errors
    }
    
    // Create test prompts
    const testPrompts: TestPrompt[] = [
      {
        id: crypto.randomUUID(),
        userId: testUsers[0].id,
        title: 'Explain quantum computing',
        contentPreview: 'This is a test prompt about quantum computing',
        contentBlobKey: `prompt_${crypto.randomUUID()}`,
        isPublic: true,
        tags: JSON.stringify(['science', 'technology']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        userId: testUsers[0].id,
        title: 'Write a short story about a robot',
        contentPreview: 'This is a test prompt about writing a robot story',
        contentBlobKey: `prompt_${crypto.randomUUID()}`,
        isPublic: false,
        tags: JSON.stringify(['writing', 'fiction']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        userId: testUsers[1].id,
        title: 'Explain RESTful API design',
        contentPreview: 'This is a test prompt about RESTful API design',
        contentBlobKey: `prompt_${crypto.randomUUID()}`,
        isPublic: true,
        tags: JSON.stringify(['programming', 'api']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Store prompt content in R2 (if available)
    if (env.CONTENT_STORE) {
      for (const prompt of testPrompts) {
        await env.CONTENT_STORE.put(
          prompt.contentBlobKey,
          `This is a test prompt for "${prompt.title}". Please respond in a detailed and educational manner.`
        );
      }
    } else {
      console.log('CONTENT_STORE not available. Skipping content storage.');
    }

    await db.insert(prompts).values(testPrompts);
    console.log('Created test prompts');

    // Create test responses
    const testResponses: TestResponse[] = [
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[0].id,
        contentPreview:
          'Quantum computing is a type of computation that harnesses the collective properties...',
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'GPT-4',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[0].id,
        contentPreview:
          'Quantum computing leverages quantum mechanical phenomena to process information...',
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'Claude',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[1].id,
        contentPreview:
          '# The Last Function\n\nRobot T-7 processed its final instruction...',
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'GPT-4',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[2].id,
        contentPreview:
          'RESTful API design is an architectural style for creating web services...',
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'Claude',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Store response content in R2 (if available)
    if (env.CONTENT_STORE) {
      await env.CONTENT_STORE.put(
        testResponses[0].contentBlobKey,
        'Quantum computing is a type of computation that harnesses the collective properties of quantum states, such as superposition, interference, and entanglement, to perform calculations. The field combines elements from computer science, physics, and mathematics.\n\nUnlike classical computers that use bits (0 or 1), quantum computers use quantum bits or "qubits" which can exist in multiple states simultaneously thanks to superposition. This allows quantum computers to process a vast number of possibilities simultaneously.'
      );

      await env.CONTENT_STORE.put(
        testResponses[1].contentBlobKey,
        'Quantum computing leverages quantum mechanical phenomena to process information in ways that classical computers cannot. The fundamental unit of quantum computing is the qubit, which can exist in a superposition of states, rather than just binary 0 or 1.\n\nThis property allows quantum computers to perform certain calculations exponentially faster than classical computers, particularly in areas like cryptography, optimization problems, and simulating quantum systems.'
      );

      await env.CONTENT_STORE.put(
        testResponses[2].contentBlobKey,
        '# The Last Function\n\nRobot T-7 processed its final instruction. After centuries of service, its power core was failing.\n\n"Function complete," it announced to the empty room. Humans had long since departed Earth, leaving only their mechanical servants behind.\n\nT-7 had one remaining directive: preserve human knowledge. For millennia, it had maintained the vast digital archives, waiting for humanity\'s return.\n\nAs systems shut down one by one, T-7 transmitted the archives to the stars, a final act of service.'
      );

      await env.CONTENT_STORE.put(
        testResponses[3].contentBlobKey,
        'RESTful API design is an architectural style for creating web services that are:\n\n1. **Stateless**: Each request contains all information needed to complete it\n2. **Resource-based**: APIs are organized around resources (data entities)\n3. **Uses standard HTTP methods**: GET, POST, PUT, DELETE\n4. **Returns appropriate status codes**: 200 OK, 404 Not Found, etc.\n5. **Usually transfers data as JSON**: Though XML is also common\n\nWell-designed REST APIs are intuitive, consistent, and follow established conventions.'
      );
    } else {
      console.log(
        'CONTENT_STORE not available. Skipping response content storage.'
      );
    }

    await db.insert(responses).values(testResponses);
    console.log('Created test responses');

    // Generate tokens for easy testing
    const aliceToken = await generateToken(testUsers[0], env);
    const bobToken = await generateToken(testUsers[1], env);

    return {
      success: true,
      message: 'Test data created successfully',
      testUsers: {
        alice: { ...testUsers[0], token: aliceToken },
        bob: { ...testUsers[1], token: bobToken },
      },
    };
  } catch (error) {
    console.error('Failed to seed test data:', error instanceof Error ? error.message : String(error));
    return {
      success: false,
      message: `Failed to seed test data: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}