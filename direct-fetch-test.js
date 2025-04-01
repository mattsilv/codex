// Direct Fetch Test for Google OAuth
// This script bypasses the browser and directly tests the OAuth API endpoint

async function testDirectFetch() {
  console.log('Starting Direct OAuth API Test');
  
  // Base URL for API
  const API_URL = 'http://localhost:8787';
  
  try {
    console.log(`Testing health endpoint: ${API_URL}/api/health`);
    
    // Test 1: Health check
    const healthResponse = await fetch(`${API_URL}/api/health`);
    console.log('Health Status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health Response:', JSON.stringify(healthData, null, 2));
    
    if (!healthResponse.ok) {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    
    // Test 2: Google Auth endpoint
    console.log(`\nTesting Google auth endpoint: ${API_URL}/api/auth/google`);
    const authResponse = await fetch(`${API_URL}/api/auth/google`);
    console.log('Auth Status:', authResponse.status);
    
    if (!authResponse.ok) {
      throw new Error(`Auth endpoint failed: ${authResponse.status}`);
    }
    
    const authData = await authResponse.json();
    console.log('Auth Response:', JSON.stringify(authData, null, 2));
    
    if (authData.url) {
      console.log('\nAnalyzing returned URL:', authData.url);
      const urlObj = new URL(authData.url);
      console.log('Protocol:', urlObj.protocol);
      console.log('Host:', urlObj.host);
      console.log('Pathname:', urlObj.pathname);
      console.log('Search params:', urlObj.search);
    }
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testDirectFetch();