/**
 * reset-database.js
 * 
 * A utility script to completely reset the D1 database and re-seed it with test data
 * For development use only!
 */

import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

console.log('Codex Database Reset Utility');
console.log('============================');
console.log('This script will COMPLETELY RESET the development database and re-seed it with test data.');
console.log('NOTE: All existing data will be PERMANENTLY DELETED!');
console.log('');

// Create readline interface with promises
const rl = readline.createInterface({ input, output });

// Get server URL from environment or default to localhost
const API_URL = process.env.API_URL || 'http://localhost:8787/api';
const ADMIN_KEY = 'dev-mode-reset';

// Force localStorage clearing on next login
const FORCE_CLEAN = true;

async function resetDatabase() {
  try {
    // For automated testing, we can bypass the confirmation
    if (process.argv.includes('--force')) {
      console.log('Bypassing confirmation due to --force flag');
    } else {
      // Ask for confirmation
      const answer = await rl.question('Type "RESET" to confirm database reset: ');
      
      if (answer.toUpperCase() !== 'RESET') {
        console.log('Database reset cancelled.');
        rl.close();
        return;
      }
    }
    
    console.log('\nResetting database...');
    console.log(`Connecting to API at ${API_URL}/reset-db...`);
    
    const response = await fetch(`${API_URL}/reset-db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': ADMIN_KEY
      },
      body: JSON.stringify({
        forceClean: FORCE_CLEAN
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ DATABASE RESET SUCCESSFUL');
      console.log('==========================');
      console.log('Message:', result.message || 'Database reset successfully');
      
      if (result.testCredentials) {
        console.log('\nTEST USER CREDENTIALS:');
        console.log(`Email: ${result.testCredentials.email}`);
        console.log(`Password: ${result.testCredentials.password}`);
      } else {
        console.log('\nTEST USER CREDENTIALS:');
        console.log(`Email: alice@example.com`);
        console.log(`Password: password123`);
      }
      
      console.log('\nYou can now login to the application with these credentials.');
      
      // Verify the database by making a health check request
      console.log('\nVerifying API health...');
      const healthCheck = await fetch(`${API_URL}/health`);
      if (healthCheck.ok) {
        console.log('✅ API Health check passed');
      } else {
        console.log('⚠️ API Health check returned status:', healthCheck.status);
      }
      
      // Verify the test user credentials
      console.log('\nVerifying test user credentials...');
      const loginCheck = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'password123'
        })
      });
      
      if (loginCheck.ok) {
        const loginResult = await loginCheck.json();
        console.log('✅ Login test succeeded!');
        
        // Access user data from the proper response structure
        const userData = loginResult.data?.user || {};
        const username = userData.username || 'unknown';
        const email = userData.email || 'unknown';
        console.log(`User authenticated: ${username} (${email})`);
      } else {
        console.log('❌ Login test failed with status:', loginCheck.status);
        try {
          const errorData = await loginCheck.json();
          console.log('Error details:', errorData);
        } catch (e) {
          console.log('Could not parse error response');
        }
      }
      
    } else {
      console.log('❌ DATABASE RESET FAILED');
      console.log('=====================');
      
      try {
        const errorData = await response.json();
        console.log('Error:', errorData.error || errorData.message || 'Unknown error');
        
        if (errorData.details) {
          console.log('Details:', errorData.details);
        }
      } catch (parseError) {
        console.log(`Server returned status ${response.status} without valid JSON`);
        console.log('Response text:', await response.text());
      }
    }
  } catch (error) {
    console.error('❌ RESET FAILED:', error.message);
    console.log('\nPossible causes:');
    console.log('- Backend server not running (start with `pnpm dev:backend`)');
    console.log('- Network connectivity issues');
    console.log('- API endpoint not available');
  } finally {
    rl.close();
  }
}

// Execute the reset function
resetDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});