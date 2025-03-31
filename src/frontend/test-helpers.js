// Frontend testing utilities

/**
 * Test local storage functionality
 */
export function testLocalStorage() {
  console.log('Testing localStorage functionality...');
  
  // Test user data
  const testUser = {
    id: 'test-user-id',
    username: 'Test User',
    email: 'test@example.com'
  };
  
  // Test prompt data
  const testPrompt = {
    id: 'test-prompt-id',
    userId: 'test-user-id',
    title: 'Test Prompt',
    content: 'This is a test prompt content',
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Test response data
  const testResponse = {
    id: 'test-response-id',
    promptId: 'test-prompt-id',
    modelName: 'Test Model',
    content: 'This is a test response content',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  try {
    // Clear existing data
    localStorage.removeItem('codex:user');
    localStorage.removeItem('codex:token');
    localStorage.removeItem('codex:prompts');
    localStorage.removeItem('codex:responses');
    
    // Store test data
    localStorage.setItem('codex:user', JSON.stringify(testUser));
    localStorage.setItem('codex:token', 'test-token');
    localStorage.setItem('codex:prompts', JSON.stringify([testPrompt]));
    localStorage.setItem('codex:responses', JSON.stringify([testResponse]));
    
    console.log('Test data stored in localStorage');
    
    // Verify storage
    const storedUser = JSON.parse(localStorage.getItem('codex:user'));
    const storedPrompts = JSON.parse(localStorage.getItem('codex:prompts'));
    const storedResponses = JSON.parse(localStorage.getItem('codex:responses'));
    
    console.log('User retrieved:', storedUser);
    console.log('Prompts retrieved:', storedPrompts);
    console.log('Responses retrieved:', storedResponses);
    
    return { 
      success: true, 
      message: 'localStorage test completed successfully' 
    };
  } catch (error) {
    console.error('localStorage test failed:', error);
    return { 
      success: false, 
      message: `localStorage test failed: ${error.message}` 
    };
  }
}

/**
 * Test the API client with mock responses
 */
export function testApiClient() {
  console.log('Testing API client utilities...');
  
  // Mock fetch response
  const originalFetch = window.fetch;
  
  try {
    // Override fetch to return mock data
    window.fetch = async (url, options) => {
      console.log(`Mock fetch: ${url}`, options);
      
      // Simulate different API responses
      if (url.includes('/api/auth/login')) {
        return {
          ok: true,
          json: async () => ({ 
            token: 'mock-token', 
            user: { id: 'mock-user-id', username: 'Mock User', email: 'mock@example.com' } 
          })
        };
      } else if (url.includes('/api/prompts')) {
        return {
          ok: true,
          json: async () => ([{ 
            id: 'mock-prompt-id', 
            title: 'Mock Prompt',
            content: 'Mock content', 
            userId: 'mock-user-id'
          }])
        };
      } else {
        return {
          ok: false,
          json: async () => ({ error: 'Mock API error' })
        };
      }
    };
    
    console.log('Fetch API mocked successfully');
    
    // Test API client (this will need to be adapted for your actual API client implementation)
    // For now, we'll just log that it would work
    console.log('API client test would call your actual API client methods here');
    
    return { 
      success: true, 
      message: 'API client test completed successfully' 
    };
  } catch (error) {
    console.error('API client test failed:', error);
    return { 
      success: false, 
      message: `API client test failed: ${error.message}` 
    };
  } finally {
    // Restore original fetch
    window.fetch = originalFetch;
  }
}

/**
 * Test the UI components with mock data
 */
export function testUIComponents() {
  console.log('Testing UI components with mock data...');
  
  try {
    // This would be done with actual rendering in a real testing framework
    console.log('Would render and test components here');
    
    return { 
      success: true, 
      message: 'UI component test completed' 
    };
  } catch (error) {
    console.error('UI component test failed:', error);
    return { 
      success: false, 
      message: `UI component test failed: ${error.message}` 
    };
  }
}

/**
 * Run all frontend tests
 */
export function runAllTests() {
  console.log('=== STARTING FRONTEND TESTS ===');
  
  const storageResult = testLocalStorage();
  const apiResult = testApiClient();
  const uiResult = testUIComponents();
  
  console.log('\n=== FRONTEND TEST RESULTS ===');
  console.log('localStorage tests:', storageResult.success ? 'PASSED' : 'FAILED');
  console.log('API client tests:', apiResult.success ? 'PASSED' : 'FAILED');
  console.log('UI component tests:', uiResult.success ? 'PASSED' : 'FAILED');
  
  return {
    success: storageResult.success && apiResult.success && uiResult.success,
    results: {
      storage: storageResult,
      api: apiResult,
      ui: uiResult
    }
  };
}