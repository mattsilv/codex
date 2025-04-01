// Script to test the Codex API
import https from 'https';

const testEndpoint = (url) => {
  console.log(`Testing API endpoint: ${url}`);

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        console.log(
          `Response headers: ${JSON.stringify(res.headers, null, 2)}`
        );

        if (data) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`Response data: ${JSON.stringify(jsonData, null, 2)}`);
          } catch (e) {
            console.log(`Response data (raw): ${data}`);
          }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    });

    req.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
};

// Test both the worker URL and the custom domain (if set up)
const workerUrl = 'https://codex-api.silv.workers.dev/api/health';
const customApiUrl = 'https://api.codex.silv.app/api/health';

// Run tests
const runTests = async () => {
  console.log('===== Testing Worker URL =====');
  try {
    await testEndpoint(workerUrl);
  } catch (error) {
    console.error('Failed to test Worker URL');
  }

  console.log('\n===== Testing Custom API URL =====');
  try {
    await testEndpoint(customApiUrl);
  } catch (error) {
    console.error('Failed to test Custom API URL - DNS may not be set up yet');
  }
};

runTests();
