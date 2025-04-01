// Login endpoint test script for backend
import http from 'http';

async function testAPILoginEndpoint() {
  console.log('Testing login endpoint with alice@example.com on backend server (port 8787)...');
  
  // Set up request data
  const data = JSON.stringify({
    email: 'alice@example.com',
    password: 'password123'
  });
  
  // This test targets the backend server directly on port 8787
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8787,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Headers:', res.headers);
        
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
    
    console.log('Sending request with data:', data);
    req.write(data);
    req.end();
  });
}

testAPILoginEndpoint().then(() => {
  console.log('Login test completed');
});