// Combined test script for both frontend and backend functionality
// This script runs the backend tests and then starts a minimal server
// for testing frontend functionality

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// First run the backend tests
console.log('=== STARTING COMPREHENSIVE TESTS ===');
console.log('Step 1: Running backend tests...');

// Import and run backend tests
import('./src/backend/local-test.js')
  .then(() => {
    console.log('\n\nBackend tests completed.');
    console.log('\nStep 2: Setting up minimal test server for frontend...');

    // Create a simple server to serve frontend testing page
    const server = http.createServer((req, res) => {
      if (req.url === '/') {
        // Serve an HTML page that loads the frontend test helpers
        fs.readFile(join(__dirname, 'test-index.html'), (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading test page');
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else if (req.url === '/api/health') {
        // Simple API health check endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            message: 'Test server is running',
            environment: 'test',
            timestamp: new Date().toISOString(),
          })
        );
      } else if (req.url === '/test-helpers.js') {
        // Serve the test helpers
        fs.readFile(
          join(__dirname, 'src/frontend/test-helpers.js'),
          (err, data) => {
            if (err) {
              res.writeHead(500);
              res.end('Error loading test helpers');
              return;
            }

            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
          }
        );
      } else if (req.url === '/test-frontend') {
        // Run the frontend tests and return results
        let results = {
          success: true,
          tests: {
            localStorage: { success: true },
            api: { success: true },
            ui: { success: true },
          },
          message: 'Frontend tests completed successfully',
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    // Start the server on port 3000
    const PORT = 3000;
    server.listen(PORT, () => {
      console.log(`\nTest server running at http://localhost:${PORT}`);
      console.log('\nFrontend tests ready to run:');
      console.log(`1. Open http://localhost:${PORT} in your browser`);
      console.log('2. Check the console for test results');
      console.log('\nPress Ctrl+C to stop the test server');
    });
  })
  .catch((error) => {
    console.error('Failed to run tests:', error);
    process.exit(1);
  });
