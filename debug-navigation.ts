/**
 * Codex API Test Suite
 * =====================
 * A comprehensive test suite for validating Codex backend API endpoints
 *
 * Usage:
 *   npx ts-node debug-navigation.ts
 *
 * Make sure to run the backend server first:
 *   bash ./start-backend.sh
 */

/**
 * Standard API response format
 */
interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  data?: T;
  error?: any;
}

/**
 * User information structure
 */
interface User {
  id: string;
  email: string;
  username: string;
}

/**
 * Authentication response
 */
interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Prompt structure
 */
interface Prompt {
  id: string;
  title: string;
  content: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response structure
 */
interface Response {
  id: string;
  content: string;
  promptId: string;
  userId: string;
  model: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Test configuration
 */
const config = {
  baseUrl: 'http://localhost:8787',
  testUser: {
    email: 'testuser@example.com',
    username: 'testuser',
    password: 'Password123!',
  },
  testPrompt: {
    title: 'Test Prompt',
    content: 'This is a test prompt created by the debug-navigation.ts script.',
    isPublic: true,
  },
  testResponse: {
    content:
      'This is a test response created by the debug-navigation.ts script.',
    model: 'gpt-3.5-turbo',
  },
};

// Store global test data
const testData = {
  authToken: '',
  userId: '',
  promptId: '',
  responseId: '',
};

/**
 * Enhanced fetch API wrapper for testing
 */
async function makeRequest<T = any>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' = 'GET',
  body: any = null,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const url = config.baseUrl + path;

  // Set default headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add auth token if available and not already set
  if (testData.authToken && !requestHeaders['Authorization']) {
    requestHeaders['Authorization'] = `Bearer ${testData.authToken}`;
  }

  const options: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`\n🚀 ${method} ${url}`);
    if (body) {
      console.log('📦 Request body:', JSON.stringify(body, null, 2));
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get('Content-Type') || '';
    let responseData;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const result: ApiResponse<T> = {
      status: response.status,
      statusText: response.statusText,
    };

    if (response.ok) {
      result.data = responseData as T;
      console.log(`✅ Status: ${response.status} ${response.statusText}`);
    } else {
      result.error = responseData;
      console.log(`❌ Status: ${response.status} ${response.statusText}`);
      console.log('Error:', responseData);
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Request failed: ${errorMessage}`);
    return {
      status: 0,
      statusText: 'Network Error',
      error: `Request failed: ${errorMessage}`,
    };
  }
}

/**
 * Basic API health check tests
 */
async function runBasicTests(): Promise<boolean> {
  console.log('\n=== 🔍 Running Basic API Tests ===');
  let success = true;

  // Test server connection
  try {
    console.log('\n> Testing basic server connection...');
    const rootResponse = await makeRequest('/');
    success = rootResponse.status >= 200 && rootResponse.status < 300;

    // Test CORS with preflight options
    console.log('\n> Testing CORS preflight...');
    const corsResponse = await makeRequest('/api/prompts', 'OPTIONS');
    success =
      success && corsResponse.status >= 200 && corsResponse.status < 300;
  } catch (error) {
    console.error('Basic tests failed:', error);
    success = false;
  }

  return success;
}

/**
 * Authentication API tests
 */
async function runAuthTests(): Promise<boolean> {
  console.log('\n=== 🔐 Running Authentication API Tests ===');
  let success = true;

  try {
    // Test registration
    console.log('\n> Testing user registration...');
    const registrationResponse = await makeRequest<AuthResponse>(
      '/api/auth/register',
      'POST',
      {
        email: config.testUser.email,
        username: config.testUser.username,
        password: config.testUser.password,
      }
    );

    // If registration succeeded or user already exists, try login
    console.log('\n> Testing user login...');
    const loginResponse = await makeRequest<AuthResponse>(
      '/api/auth/login',
      'POST',
      {
        email: config.testUser.email,
        password: config.testUser.password,
      }
    );

    if (loginResponse.data?.token) {
      console.log('👤 User login successful');
      testData.authToken = loginResponse.data.token;
      testData.userId = loginResponse.data.user.id;

      // Test user profile endpoint
      console.log('\n> Testing user profile endpoint...');
      const profileResponse = await makeRequest('/api/auth/me');
      success =
        success &&
        profileResponse.status >= 200 &&
        profileResponse.status < 300;

      // Test token validation
      console.log('\n> Testing token validation...');
      const debugResponse = await makeRequest('/api/auth/debug');
      success =
        success && debugResponse.status >= 200 && debugResponse.status < 300;
    } else {
      console.log('❌ Login failed, skipping authenticated tests');
      success = false;
    }
  } catch (error) {
    console.error('Auth tests failed:', error);
    success = false;
  }

  return success;
}

/**
 * Prompt API tests
 */
async function runPromptTests(): Promise<boolean> {
  console.log('\n=== 📝 Running Prompt API Tests ===');
  let success = true;

  try {
    // Test getting public prompts (should work without auth)
    console.log('\n> Testing public prompts endpoint...');
    const publicPromptsResponse = await makeRequest<Prompt[]>(
      '/api/prompts/public'
    );
    success =
      publicPromptsResponse.status >= 200 && publicPromptsResponse.status < 300;

    if (!testData.authToken) {
      console.log('⚠️ No auth token, skipping authenticated prompt tests');
      return false;
    }

    // Create a new prompt
    console.log('\n> Creating new test prompt...');
    const createPromptResponse = await makeRequest<Prompt>(
      '/api/prompts',
      'POST',
      config.testPrompt
    );

    if (createPromptResponse.data?.id) {
      testData.promptId = createPromptResponse.data.id;
      console.log(`📝 Created prompt with ID: ${testData.promptId}`);

      // Get prompt by ID
      console.log('\n> Testing get prompt by ID...');
      const getPromptResponse = await makeRequest<Prompt>(
        `/api/prompts/${testData.promptId}`
      );
      success =
        success &&
        getPromptResponse.status >= 200 &&
        getPromptResponse.status < 300;

      // Update prompt
      console.log('\n> Testing update prompt...');
      const updatePromptResponse = await makeRequest<Prompt>(
        `/api/prompts/${testData.promptId}`,
        'PUT',
        {
          title: `${config.testPrompt.title} (Updated)`,
          content: `${config.testPrompt.content} This has been updated.`,
          isPublic: config.testPrompt.isPublic,
        }
      );
      success =
        success &&
        updatePromptResponse.status >= 200 &&
        updatePromptResponse.status < 300;

      // Get all user prompts
      console.log('\n> Testing get user prompts...');
      const userPromptsResponse =
        await makeRequest<Prompt[]>('/api/prompts/user');
      success =
        success &&
        userPromptsResponse.status >= 200 &&
        userPromptsResponse.status < 300;
    } else {
      console.log('❌ Failed to create test prompt');
      success = false;
    }
  } catch (error) {
    console.error('Prompt tests failed:', error);
    success = false;
  }

  return success;
}

/**
 * Response API tests
 */
async function runResponseTests(): Promise<boolean> {
  console.log('\n=== 💬 Running Response API Tests ===');
  let success = true;

  if (!testData.authToken || !testData.promptId) {
    console.log('⚠️ No auth token or prompt ID, skipping response tests');
    return false;
  }

  try {
    // Create a new response
    console.log('\n> Creating new test response...');
    const createResponseResponse = await makeRequest<Response>(
      '/api/responses',
      'POST',
      {
        ...config.testResponse,
        promptId: testData.promptId,
      }
    );

    if (createResponseResponse.data?.id) {
      testData.responseId = createResponseResponse.data.id;
      console.log(`💬 Created response with ID: ${testData.responseId}`);

      // Get responses for prompt
      console.log('\n> Testing get responses for prompt...');
      const promptResponsesResponse = await makeRequest<Response[]>(
        `/api/responses/prompt/${testData.promptId}`
      );
      success =
        success &&
        promptResponsesResponse.status >= 200 &&
        promptResponsesResponse.status < 300;

      // Update response
      console.log('\n> Testing update response...');
      const updateResponseResponse = await makeRequest<Response>(
        `/api/responses/${testData.responseId}`,
        'PUT',
        {
          content: `${config.testResponse.content} This has been updated.`,
          model: config.testResponse.model,
        }
      );
      success =
        success &&
        updateResponseResponse.status >= 200 &&
        updateResponseResponse.status < 300;
    } else {
      console.log('❌ Failed to create test response');
      success = false;
    }
  } catch (error) {
    console.error('Response tests failed:', error);
    success = false;
  }

  return success;
}

/**
 * Test cleanup
 */
async function runCleanupTests(): Promise<boolean> {
  console.log('\n=== 🧹 Running Cleanup Tests ===');
  let success = true;

  if (!testData.authToken) {
    console.log('⚠️ No auth token, skipping cleanup tests');
    return false;
  }

  try {
    // Delete response if created
    if (testData.responseId) {
      console.log('\n> Deleting test response...');
      const deleteResponseResponse = await makeRequest(
        `/api/responses/${testData.responseId}`,
        'DELETE'
      );
      success =
        success &&
        deleteResponseResponse.status >= 200 &&
        deleteResponseResponse.status < 300;
    }

    // Delete prompt if created
    if (testData.promptId) {
      console.log('\n> Deleting test prompt...');
      const deletePromptResponse = await makeRequest(
        `/api/prompts/${testData.promptId}`,
        'DELETE'
      );
      success =
        success &&
        deletePromptResponse.status >= 200 &&
        deletePromptResponse.status < 300;
    }

    // We don't delete the test user to allow for repeated test runs
    // In a real application, we would add user deletion test here
  } catch (error) {
    console.error('Cleanup tests failed:', error);
    success = false;
  }

  return success;
}

/**
 * Main function to run all tests
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Codex API Tests...');
  console.log(
    '⚠️ Make sure the backend server is running at http://localhost:8787'
  );

  const results = {
    basic: false,
    auth: false,
    prompts: false,
    responses: false,
    cleanup: false,
  };

  try {
    // Run tests sequentially since they depend on each other
    results.basic = await runBasicTests();

    if (results.basic) {
      results.auth = await runAuthTests();
    }

    if (results.auth) {
      results.prompts = await runPromptTests();
    }

    if (results.prompts) {
      results.responses = await runResponseTests();
    }

    // Always try to clean up, even if some tests failed
    results.cleanup = await runCleanupTests();

    // Print results summary
    console.log('\n=== 📊 Test Results Summary ===');
    console.log(
      `Basic API Tests: ${results.basic ? '✅ Passed' : '❌ Failed'}`
    );
    console.log(
      `Authentication Tests: ${results.auth ? '✅ Passed' : '❌ Failed'}`
    );
    console.log(
      `Prompt API Tests: ${results.prompts ? '✅ Passed' : '❌ Failed'}`
    );
    console.log(
      `Response API Tests: ${results.responses ? '✅ Passed' : '❌ Failed'}`
    );
    console.log(
      `Cleanup Tests: ${results.cleanup ? '✅ Passed' : '❌ Failed'}`
    );

    const overallSuccess =
      results.basic &&
      results.auth &&
      results.prompts &&
      results.responses &&
      results.cleanup;
    console.log(
      `\nOverall Test Status: ${overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Test suite failed with error: ${errorMessage}`);
  }
}

// Run the tests
main();
