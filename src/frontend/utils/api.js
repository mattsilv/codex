import { API_URL, STORAGE_KEYS } from '@shared/constants';

// Helper for making authenticated API requests
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // Handle authentication errors
  if (response.status === 401) {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // If we're in the browser, redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
}

// Auth API client
export const authAPI = {
  // Login user
  async login(email, password) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token and user data
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    
    return data;
  },
  
  // Register user
  async register(username, email, password) {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    
    // Store token and user data
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    
    return data;
  },
  
  // Get current user
  async getProfile() {
    return fetchAPI('/auth/me');
  },
  
  // Update user profile
  async updateProfile(userData) {
    const data = await fetchAPI('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    // Update stored user data
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    
    return data;
  },
  
  // Logout user
  logout() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

// Prompts API client
export const promptsAPI = {
  // Get all user prompts
  async getPrompts() {
    return fetchAPI('/prompts');
  },
  
  // Get single prompt with responses
  async getPrompt(id) {
    return fetchAPI(`/prompts/${id}`);
  },
  
  // Create new prompt
  async createPrompt(promptData) {
    return fetchAPI('/prompts', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });
  },
  
  // Update prompt
  async updatePrompt(id, promptData) {
    return fetchAPI(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promptData),
    });
  },
  
  // Delete prompt
  async deletePrompt(id) {
    return fetchAPI(`/prompts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Responses API client
export const responsesAPI = {
  // Get all responses for a prompt
  async getResponses(promptId) {
    return fetchAPI(`/prompts/${promptId}/responses`);
  },
  
  // Get single response
  async getResponse(promptId, responseId) {
    return fetchAPI(`/prompts/${promptId}/responses/${responseId}`);
  },
  
  // Create new response
  async createResponse(promptId, responseData) {
    return fetchAPI(`/prompts/${promptId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  },
  
  // Update response
  async updateResponse(promptId, responseId, responseData) {
    return fetchAPI(`/prompts/${promptId}/responses/${responseId}`, {
      method: 'PUT',
      body: JSON.stringify(responseData),
    });
  },
  
  // Delete response
  async deleteResponse(promptId, responseId) {
    return fetchAPI(`/prompts/${promptId}/responses/${responseId}`, {
      method: 'DELETE',
    });
  },
};