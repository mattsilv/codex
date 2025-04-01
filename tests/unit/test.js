// Test script for the Codex application

// eslint-disable-next-line no-console
console.log('=== CODEX APPLICATION TEST SUITE ===');
// eslint-disable-next-line no-console
console.log('This script helps verify your local setup is working correctly.');
// eslint-disable-next-line no-console
console.log('\nThere are two ways to run the tests:');
// eslint-disable-next-line no-console
console.log('\n1. Backend tests (Node.js environment):');
// eslint-disable-next-line no-console
console.log('   node --experimental-modules src/backend/local-test.js');
// eslint-disable-next-line no-console
console.log('\n2. Frontend tests (Browser environment):');
// eslint-disable-next-line no-console
console.log('   1. Start the frontend server with "npm run dev"');
// eslint-disable-next-line no-console
console.log('   2. Open the browser console');
// eslint-disable-next-line no-console
console.log('   3. Run the following command in the console:');
// eslint-disable-next-line no-console
console.log(
  '      import { runAllTests } from "./test-helpers.js"; runAllTests();'
);
// eslint-disable-next-line no-console
console.log('\nFor full stack testing:');
// eslint-disable-next-line no-console
console.log(
  '1. Start the backend: "npm run dev:worker -- --persist-to=.wrangler/state"'
);
// eslint-disable-next-line no-console
console.log('2. Start the frontend: "npm run dev"');
// eslint-disable-next-line no-console
console.log('3. Navigate to http://localhost:3001 in your browser');
// eslint-disable-next-line no-console
console.log(
  '4. Seed test data by visiting: http://localhost:8787/api/seed-test-data'
);
// eslint-disable-next-line no-console
console.log('5. Login with test credentials:');
// eslint-disable-next-line no-console
console.log('   - alice@example.com / password123');
// eslint-disable-next-line no-console
console.log('   - bob@example.com / password123');

// Check for Node.js flags to run backend tests directly
if (process.argv.includes('--backend')) {
  // eslint-disable-next-line no-console
  console.log('\n\nRunning backend tests directly...');
  import('./src/backend/local-test.js').catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to run backend tests:', error);
  });
}
