// Comprehensive script to verify the authentication setup
import http from 'http';

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = responseData ? JSON.parse(responseData) : {};
          resolve({ 
            status: res.statusCode, 
            headers: res.headers,
            data: jsonResponse 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            headers: res.headers,
            data: responseData 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function verifyAuthSetup() {
  console.log('🔍 CODEX AUTHENTICATION VERIFICATION\n');
  
  // Step 1: Check if backend is running
  console.log('STEP 1: Verifying backend API health...');
  try {
    const healthResult = await makeRequest({
      hostname: 'localhost',
      port: 8787,
      path: '/api/health',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (healthResult.status === 200) {
      console.log('✅ Backend API is running');
      console.log(`   Environment: ${healthResult.data.data.environment}`);
      console.log(`   Version: ${healthResult.data.data.version}`);
    } else {
      console.log('❌ Backend API health check failed');
      console.log(`   Status: ${healthResult.status}`);
      console.log(`   Response: ${JSON.stringify(healthResult.data)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend API is not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('   Please make sure to run "pnpm dev:all" first');
    return false;
  }
  
  console.log('');
  
  // Step 2: Check if test user login works
  console.log('STEP 2: Testing login with alice@example.com...');
  try {
    const loginData = JSON.stringify({
      email: 'alice@example.com',
      password: 'password123'
    });
    
    const loginResult = await makeRequest({
      hostname: 'localhost',
      port: 8787,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    }, loginData);
    
    if (loginResult.status === 200 && loginResult.data.success) {
      console.log('✅ Login successful');
      console.log(`   User ID: ${loginResult.data.data.user.id}`);
      console.log(`   Username: ${loginResult.data.data.user.username}`);
      console.log(`   Token received: ${loginResult.data.data.token ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Login failed');
      console.log(`   Status: ${loginResult.status}`);
      console.log(`   Response: ${JSON.stringify(loginResult.data)}`);
      
      // Try to diagnose the issue
      if (loginResult.status === 401) {
        console.log('\n   Potential issue: Credentials are not valid');
        console.log('   Recommendation: Run "node reset-and-seed-db.js" to reset the database with test users');
      } else if (loginResult.status === 429) {
        console.log('\n   Potential issue: Rate limiting is active');
        console.log('   Recommendation: Wait a few minutes and try again');
      } else if (loginResult.status === 404) {
        console.log('\n   Potential issue: Login endpoint not found');
        console.log('   Recommendation: Check that backend routes are set up correctly');
      }
      
      return false;
    }
  } catch (error) {
    console.log('❌ Login request failed');
    console.log(`   Error: ${error.message}`);
    return false;
  }
  
  console.log('');
  
  // Step 3: Check CORS headers
  console.log('STEP 3: Verifying CORS headers...');
  try {
    const corsResult = await makeRequest({
      hostname: 'localhost',
      port: 8787,
      path: '/api/health',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json'
      }
    });
    
    const corsHeaders = {
      allowOrigin: corsResult.headers['access-control-allow-origin'],
      allowMethods: corsResult.headers['access-control-allow-methods'],
      allowHeaders: corsResult.headers['access-control-allow-headers'],
      allowCredentials: corsResult.headers['access-control-allow-credentials'],
    };
    
    console.log('CORS Headers received:');
    console.log(`   Access-Control-Allow-Origin: ${corsHeaders.allowOrigin || 'not set'}`);
    console.log(`   Access-Control-Allow-Methods: ${corsHeaders.allowMethods || 'not set'}`);
    console.log(`   Access-Control-Allow-Headers: ${corsHeaders.allowHeaders || 'not set'}`);
    console.log(`   Access-Control-Allow-Credentials: ${corsHeaders.allowCredentials || 'not set'}`);
    
    if (corsHeaders.allowOrigin) {
      if (corsHeaders.allowOrigin === '*' || corsHeaders.allowOrigin === 'http://localhost:3001') {
        console.log('✅ CORS origin header is correctly set');
      } else {
        console.log('⚠️ CORS origin header may not include frontend origin');
      }
    } else {
      console.log('❌ CORS origin header is missing');
    }
  } catch (error) {
    console.log('❌ CORS check failed');
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('');
  console.log('🎉 AUTHENTICATION VERIFICATION COMPLETED 🎉');
  console.log('\nFRONTEND LOGIN CREDENTIALS:');
  console.log('   Email: alice@example.com');
  console.log('   Password: password123');
  console.log('\nYou can now login at http://localhost:3001/auth');
  
  return true;
}

verifyAuthSetup()
  .then((result) => {
    if (!result) {
      console.log('\n❌ Some verification steps failed. Please check the logs above for details.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Verification process failed:', error);
    process.exit(1);
  });