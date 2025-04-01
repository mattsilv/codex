// Script to call the seed data endpoint
import http from 'http';

async function seedTestData() {
  console.log('Seeding test data (alice@example.com/password123, bob@example.com/password123)...');
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8787,
      path: '/api/seed-test-data',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log('Response:', JSON.stringify(jsonResponse, null, 2));
          resolve({ status: res.statusCode, data: jsonResponse });
        } catch (e) {
          console.log('Raw response:', responseData);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request:', error);
      reject(error);
    });
    
    req.end();
  });
}

seedTestData().then(() => {
  console.log('Test data seeding completed');
});