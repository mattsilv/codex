// Simple script to test the API health endpoint
import http from 'http';

async function testApiHealth() {
  console.log('Testing API health on http://localhost:8787/api/health...');
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8787,
      path: '/api/health',
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

testApiHealth()
  .then(() => {
    console.log('Health check completed');
  })
  .catch(error => {
    console.error('Health check failed:', error);
  });