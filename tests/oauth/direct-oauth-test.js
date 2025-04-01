// Direct Google OAuth URL Test
import http from 'http';

async function testGoogleAuthEndpoint() {
  console.log('Testing Google OAuth endpoint directly');
  
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 8787,
      path: '/api/auth/google',
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3001',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log('Status:', res.statusCode);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Raw response data:', data);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('Response JSON:', JSON.stringify(jsonData, null, 2));
          
          // Check if we have a Google authorization URL
          if (jsonData.url) {
            console.log('\nSUCCESS: Received Google OAuth URL:', jsonData.url);
            resolve(jsonData.url);
          } else if (jsonData.data && jsonData.data.url) {
            console.log('\nSUCCESS: Received Google OAuth URL:', jsonData.data.url);
            resolve(jsonData.data.url);
          } else {
            console.log('\nERROR: No OAuth URL found in response');
            resolve(null);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
          console.log('Raw data received:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });
    
    req.end();
  });
}

testGoogleAuthEndpoint()
  .then(url => {
    if (url) {
      console.log('\nTo test the full flow, open this URL in a browser:');
      console.log(url);
    }
  })
  .catch(error => {
    console.error('Test failed:', error);
  });