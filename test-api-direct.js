// Test API Connection directly from Node.js
// This script tests the API connection to diagnose OAuth issues

import fetch from 'node-fetch';

async function testApiConnection() {
  console.log('Testing API connection...');
  
  const API_URL = 'http://localhost:8787';
  
  try {
    // Test 1: Health endpoint
    console.log('\nTesting health endpoint...');
    const healthUrl = `${API_URL}/api/health`;
    console.log(`Fetching ${healthUrl}`);
    
    const healthResponse = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('Health status:', healthResponse.status);
    console.log('Health headers:', [...healthResponse.headers.entries()]);
    
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    // Test 2: Google OAuth endpoint
    console.log('\nTesting Google OAuth endpoint...');
    const authUrl = `${API_URL}/api/auth/google`;
    console.log(`Fetching ${authUrl}`);
    
    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log('Auth status:', authResponse.status);
    console.log('Auth headers:', [...authResponse.headers.entries()]);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Auth response:', authData);
      console.log('\nRedirect URL:', authData.url);
    } else {
      console.error('Failed to get OAuth URL:', authResponse.statusText);
    }
    
  } catch (error) {
    console.error('Error during API test:', error);
  }
}

// Run the test
testApiConnection();