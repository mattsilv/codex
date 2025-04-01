// Script to reset and re-seed the database with test users
import http from 'http';

async function resetAndSeedDatabase() {
  console.log('Resetting and re-seeding database with alice@example.com/password123...');
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8787,
      path: '/api/reset-and-seed-db',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': 'dev-mode-reset'
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

resetAndSeedDatabase()
  .then(() => {
    console.log('Testing login with newly created user alice@example.com...');
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        email: 'alice@example.com',
        password: 'password123'
      });
      
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
          console.log(`Login Status Code: ${res.statusCode}`);
          
          try {
            const jsonResponse = JSON.parse(responseData);
            console.log('Login Response:', jsonResponse.success ? 'SUCCESS' : 'FAILED');
            if (jsonResponse.success) {
              console.log('User can log in with: alice@example.com / password123');
            } else {
              console.log('Login failed. Error:', jsonResponse.error?.message || 'Unknown error');
            }
            resolve({ status: res.statusCode, data: jsonResponse });
          } catch (e) {
            console.log('Raw login response:', responseData);
            resolve({ status: res.statusCode, data: responseData });
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Error making login request:', error);
        reject(error);
      });
      
      console.log('Sending login request with data:', data);
      req.write(data);
      req.end();
    });
  })
  .then((result) => {
    console.log('\nDATABASE RESET COMPLETE');
    console.log('======================');
    console.log('TEST USER CREDENTIALS:');
    console.log('Email: alice@example.com');
    console.log('Password: password123');
    console.log('======================');
    
    if (result?.data?.success) {
      console.log('✅ LOGIN SUCCESS: The frontend app (http://localhost:3000) should now be able to login with these credentials');
    } else {
      console.log('❌ LOGIN FAILED: There may still be issues with the login system. Check the error message above.');
      console.log('\nIf login still fails:');
      console.log('1. Check CORS settings in ./src/backend/middleware/cors.ts');
      console.log('2. Verify that the database is properly initialized');
      console.log('3. Check the password hashing in ./src/backend/utils/auth.ts');
    }
  })
  .catch(error => {
    console.error('Reset process failed:', error);
  });