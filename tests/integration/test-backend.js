// Simple Express backend for testing frontend functionality
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = 8888;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory stores for testing
const users = new Map();
const prompts = new Map();
const responses = new Map();

// Initialize with some test data
function seedTestData() {
  // Create test users
  const testUsers = [
    {
      id: crypto.randomUUID(),
      email: 'alice@example.com',
      username: 'alice',
      passwordHash: crypto
        .createHash('sha256')
        .update('password123')
        .digest('base64'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      email: 'bob@example.com',
      username: 'bob',
      passwordHash: crypto
        .createHash('sha256')
        .update('password123')
        .digest('base64'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  testUsers.forEach((user) => {
    users.set(user.id, user);
  });

  // Create test prompts
  const testPrompts = [
    {
      id: crypto.randomUUID(),
      userId: testUsers[0].id,
      title: 'Explain quantum computing',
      contentPreview: 'This is a test prompt about quantum computing',
      contentBlobKey: `prompt_${crypto.randomUUID()}`,
      isPublic: true,
      tags: ['science', 'technology'],
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
      tags: ['writing', 'fiction'],
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
      tags: ['programming', 'api'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  testPrompts.forEach((prompt) => {
    prompts.set(prompt.id, prompt);
  });

  // Create test responses
  const testResponses = [
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
  ];

  testResponses.forEach((response) => {
    responses.set(response.id, response);
  });

  console.log('Test data seeded successfully');
  return {
    userCount: users.size,
    promptCount: prompts.size,
    responseCount: responses.size,
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Test server is running',
    environment: 'test',
    timestamp: new Date().toISOString(),
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user by email
  let foundUser = null;
  for (const user of users.values()) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (!foundUser) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Simple password verification
  const passwordHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('base64');
  if (passwordHash !== foundUser.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate a simple token
  const token = `test-token-${crypto.randomUUID()}`;

  res.status(200).json({
    token,
    user: {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res
      .status(400)
      .json({ error: 'Email, username, and password are required' });
  }

  // Check if user already exists
  for (const user of users.values()) {
    if (user.email === email) {
      return res
        .status(409)
        .json({ error: 'User with this email already exists' });
    }
  }

  // Create new user
  const userId = crypto.randomUUID();
  const passwordHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('base64');
  const now = new Date().toISOString();

  const newUser = {
    id: userId,
    username,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  users.set(userId, newUser);

  // Generate a simple token
  const token = `test-token-${crypto.randomUUID()}`;

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    },
  });
});

// Seed test data endpoint
app.get('/api/seed-test-data', (req, res) => {
  const result = seedTestData();
  res.json({
    success: true,
    message: 'Test data seeded successfully',
    stats: result,
  });
});

// Prompts endpoints
app.get('/api/prompts', (req, res) => {
  const promptList = Array.from(prompts.values());
  res.json(promptList);
});

app.get('/api/prompts/:id', (req, res) => {
  const prompt = prompts.get(req.params.id);

  if (!prompt) {
    return res.status(404).json({ error: 'Prompt not found' });
  }

  res.json(prompt);
});

// Responses endpoints
app.get('/api/responses', (req, res) => {
  const { promptId } = req.query;

  if (promptId) {
    const filteredResponses = Array.from(responses.values()).filter(
      (response) => response.promptId === promptId
    );
    return res.json(filteredResponses);
  }

  const responseList = Array.from(responses.values());
  res.json(responseList);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Test backend server running at http://localhost:${PORT}`);
  // Seed initial test data
  seedTestData();
});
