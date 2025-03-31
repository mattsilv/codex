// Test script for the Codex application

console.log('=== CODEX APPLICATION TEST SUITE ===');
console.log('This script helps verify your local setup is working correctly.');
console.log('\nThere are two ways to run the tests:');
console.log('\n1. Backend tests (Node.js environment):');
console.log('   node --experimental-modules src/backend/local-test.js');
console.log('\n2. Frontend tests (Browser environment):');
console.log('   1. Start the frontend server with "npm run dev"');
console.log('   2. Open the browser console');
console.log('   3. Run the following command in the console:');
console.log('      import { runAllTests } from "./test-helpers.js"; runAllTests();');
console.log('\nFor full stack testing:');
console.log('1. Start the backend: "npm run dev:worker -- --persist-to=.wrangler/state"');
console.log('2. Start the frontend: "npm run dev"');
console.log('3. Navigate to http://localhost:3001 in your browser');
console.log('4. Seed test data by visiting: http://localhost:8787/api/seed-test-data');
console.log('5. Login with test credentials:');
console.log('   - alice@example.com / password123');
console.log('   - bob@example.com / password123');

// Check for Node.js flags to run backend tests directly
if (process.argv.includes('--backend')) {
  console.log('\n\nRunning backend tests directly...');
  import('./src/backend/local-test.js')
    .catch(error => {
      console.error('Failed to run backend tests:', error);
    });
}