import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { createDb } from '../db/client.js';
import { users, prompts, responses } from '../db/schema.js';
import { generateToken } from './auth.js';
import { storeContent, getContent } from './storage.js';

/**
 * Seeds the database with test data for development and testing
 */
export async function seedTestData(env) {
  try {
    console.log('Seeding test data...');
    
    // Create DB instance
    const db = createDb(env.DB);
    
    // Check if we already have users
    const existingUsers = await db.select().from(users);
    if (existingUsers.length > 0) {
      console.log('Test data already exists. Skipping seed operation.');
      return { success: true, message: 'Test data already exists' };
    }
    
    // Create test users
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const testUsers = [
      {
        id: crypto.randomUUID(),
        email: 'alice@example.com',
        username: 'alice',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        email: 'bob@example.com',
        username: 'bob',
        passwordHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    await db.insert(users).values(testUsers);
    console.log('Created test users');
    
    // Create test prompts
    const testPrompts = [
      {
        id: crypto.randomUUID(),
        userId: testUsers[0].id,
        title: 'Explain quantum computing',
        contentPreview: 'This is a test prompt about quantum computing',
        contentBlobKey: `prompt_${crypto.randomUUID()}`,
        isPublic: true,
        tags: JSON.stringify(['science', 'technology']),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
      }
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
    const testResponses = [
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[0].id,
        contentPreview: "Quantum computing is a type of computation that harnesses the collective properties...",
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'GPT-4',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[0].id,
        contentPreview: "Quantum computing leverages quantum mechanical phenomena to process information...",
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'Claude',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[1].id,
        contentPreview: "# The Last Function\n\nRobot T-7 processed its final instruction...",
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'GPT-4',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: crypto.randomUUID(),
        promptId: testPrompts[2].id,
        contentPreview: "RESTful API design is an architectural style for creating web services...",
        contentBlobKey: `response_${crypto.randomUUID()}`,
        modelName: 'Claude',
        isMarkdown: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
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
      console.log('CONTENT_STORE not available. Skipping response content storage.');
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
        bob: { ...testUsers[1], token: bobToken }
      }
    };
  } catch (error) {
    console.error('Failed to seed test data:', error);
    return { success: false, message: `Failed to seed test data: ${error.message}` };
  }
}