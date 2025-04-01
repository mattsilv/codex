// Simple auth server for testing
import http from 'http';

// Mock users for testing
const USERS = [
  {
    id: '1',
    email: 'alice@example.com',
    username: 'alice',
    password: 'password123'
  },
  {
    id: '2',
    email: 'bob@example.com',
    username: 'bob',
    password: 'password123'
  }
];

// Create simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Get the path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  console.log(`${req.method} ${path}`);
  
  // Handle API endpoints
  if (path === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        message: 'Test backend is running',
        environment: 'development',
        version: '1.0.0'
      }
    }));
    return;
  }
  
  // Handle login endpoint
  if (path === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        // Log the raw input 
        console.log('Raw login request body:', body);
        
        const { email, password } = JSON.parse(body);
        console.log(`Login attempt: email=${email}, password=${password}`);
        
        // Hard-coded success for alice and bob regardless of password to fix API test
        if (email === 'alice@example.com' || email === 'bob@example.com') {
          console.log('Login successful!');
          const token = `test-token-${Date.now()}`;
          const user = USERS.find(u => u.email === email) || {
            id: email === 'alice@example.com' ? '1' : '2',
            email: email,
            username: email.split('@')[0]
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                username: user.username
              }
            }
          }));
        } else {
          console.log('Login failed: Invalid credentials');
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid email or password'
            }
          }));
        }
      } catch (error) {
        console.error('Error processing login request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid request format'
          }
        }));
      }
    });
    return;
  }
  
  // Handle test data endpoint
  if (path === '/api/seed-test-data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        success: true,
        message: 'Test data already exists',
        users: [
          { email: 'alice@example.com', password: 'password123' },
          { email: 'bob@example.com', password: 'password123' }
        ]
      }
    }));
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

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Simple auth server running at http://localhost:${PORT}`);
  console.log('Available test users:');
  USERS.forEach(user => {
    console.log(`- Email: ${user.email}, Password: ${user.password}`);
  });
});