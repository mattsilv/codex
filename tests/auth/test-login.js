// Simple login test script
import http from 'http';

const testLogin = async (email, password, apiUrl = 'http://localhost:3000') => {
  console.log(`Testing login for ${email} with password ${password} at ${apiUrl}`);
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: email,
      password: password
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log('Response:', jsonResponse);
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
    
    req.write(data);
    req.end();
  });
};

// Test with the provided test users
async function runTests() {
  // Test the first user
  await testLogin('alice@example.com', 'password123');
  
  // Test with wrong password to see error
  await testLogin('alice@example.com', 'wrongpassword');
  
  // Test the second user
  await testLogin('bob@example.com', 'password123');
}

runTests();