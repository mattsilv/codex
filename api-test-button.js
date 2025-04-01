// Test script for the API test button functionality
import http from 'http';

// Function to test API endpoint(s)
async function testApi() {
  console.log("Testing the API button...");
  
  // This should match the endpoint called by the API test button
  // Let's try to determine what endpoint it's using
  
  // First try the seed test data endpoint which should always work
  const seedRequest = new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/seed-test-data',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Seed endpoint status:', res.statusCode);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error contacting seed endpoint:', error);
      reject(error);
    });
    
    req.end();
  });
  
  // Now try the root API endpoint to see if it's responding
  const rootRequest = new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Root API endpoint status:', res.statusCode);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error contacting root API endpoint:', error);
      reject(error);
    });
    
    req.end();
  });
  
  // Try both and report results
  try {
    const [seedResults, rootResults] = await Promise.all([seedRequest, rootRequest]);
    console.log('\nSeed endpoint results:', JSON.stringify(seedResults.data, null, 2));
    console.log('\nRoot API endpoint results:', JSON.stringify(rootResults.data, null, 2));
  } catch (error) {
    console.error('Test failure:', error);
  }
}

testApi();