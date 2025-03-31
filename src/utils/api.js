// API client for Codex
export const API_URL = 'http://localhost:8787/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json();
};

// Function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Function to migrate localStorage data to the API
export const migrateLocalData = async () => {
  try {
    // Check if we have data to migrate
    const storedPrompts = localStorage.getItem('prompts');
    const storedResponses = localStorage.getItem('responses');
    
    if (!storedPrompts) return { success: true, migrated: false, message: 'No local data to migrate' };
    
    // Get the authentication token
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, message: 'Not authenticated, please login first' };
    
    const parsedPrompts = JSON.parse(storedPrompts);
    const parsedResponses = storedResponses ? JSON.parse(storedResponses) : [];
    
    // Migrate each prompt and its responses
    let migratedPrompts = 0;
    let migratedResponses = 0;
    
    for (const prompt of parsedPrompts) {
      // Create the prompt
      const newPrompt = await api.prompts.create({
        title: prompt.title,
        content: prompt.content,
        isPublic: prompt.isPublic || false,
        tags: prompt.tags || []
      });
      
      migratedPrompts++;
      
      // Find responses for this prompt and migrate them
      const promptResponses = parsedResponses.filter(r => r.promptId === prompt.id);
      for (const response of promptResponses) {
        await api.responses.create({
          promptId: newPrompt.id,
          content: response.content,
          modelName: response.modelName,
          isMarkdown: response.isMarkdown || true
        });
        migratedResponses++;
      }
    }
    
    return {
      success: true,
      migrated: true,
      migratedPrompts,
      migratedResponses,
      message: `Successfully migrated ${migratedPrompts} prompts and ${migratedResponses} responses`
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error.message}`
    };
  }
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      return handleResponse(response);
    },
    
    register: async (userData) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      return handleResponse(response);
    },
    
    getProfile: async () => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      return handleResponse(response);
    },
    
    updateProfile: async (profileData) => {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      return handleResponse(response);
    }
  },
  
  // Prompts
  prompts: {
    getAll: async () => {
      const response = await fetch(`${API_URL}/prompts`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
    
    get: async (id) => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
    
    create: async (promptData) => {
      const response = await fetch(`${API_URL}/prompts`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptData)
      });
      return handleResponse(response);
    },
    
    update: async (id, promptData) => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(promptData)
      });
      return handleResponse(response);
    },
    
    delete: async (id) => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }
      
      return true;
    }
  },
  
  // Responses
  responses: {
    getAll: async (promptId) => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
    
    get: async (promptId, responseId) => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses/${responseId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
    
    create: async (promptId, responseData) => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });
      return handleResponse(response);
    },
    
    update: async (promptId, responseId, responseData) => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses/${responseId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });
      return handleResponse(response);
    },
    
    delete: async (promptId, responseId) => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses/${responseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }
      
      return true;
    }
  }
};