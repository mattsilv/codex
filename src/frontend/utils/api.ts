// API client for Codex (TypeScript version)
import { STORAGE_KEYS } from '@shared/constants';

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Rename this interface to avoid conflict with global Fetch Response
export interface ApiResponse {
  id: string;
  promptId: string;
  modelName: string;
  content: string;
  isMarkdown: boolean;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface PromptData {
  title: string;
  content: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface ResponseData {
  modelName: string;
  content: string;
  isMarkdown?: boolean;
  settings?: Record<string, unknown>;
}

export interface ProfileUpdateData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const getApiUrl = (): string => {
  // Check for production domains
  const hostname = window.location.hostname;
  if (hostname === 'codex.silv.app') {
    return 'https://api.codex.silv.app';
  } else if (hostname.includes('codex-abq.pages.dev')) {
    return 'https://codex-api.silv.workers.dev';
  } else {
    // Local development
    return 'http://localhost:8787/api';
  }
};

export const API_URL: string = getApiUrl();

// Default fetch options to include with all requests
const getDefaultFetchOptions = (): RequestInit => {
  console.log('Configuring fetch options for API URL:', API_URL);
  return {
    // Always include credentials for CORS requests
    credentials: 'include',
    // Ensure cookies are included with cross-origin requests
    mode: 'cors'
  };
};

// Helper function to handle API responses with better error handling
const handleResponse = async <T>(response: globalThis.Response): Promise<T> => {
  if (!response.ok) {
    try {
      // Try to parse error as JSON
      const errorData = await response.json();
      console.error('API error response:', errorData);
      
      // Extract error details for better user feedback
      const errorMessage = errorData.error?.message || 
                          (typeof errorData.error === 'string' ? errorData.error : null) || 
                          `API error: ${response.status}`;
                          
      throw new Error(errorMessage);
    } catch (parseError) {
      // Fallback if response isn't valid JSON
      console.error('Error parsing API error response:', parseError);
      throw new Error(`API error (${response.status}): Unable to connect to server`);
    }
  }
  return response.json() as Promise<T>;
};

// Function to get auth headers - not needed with cookie auth
const getAuthHeaders = (): Record<string, string> => {
  // No need to add Authorization header - session is maintained via HTTP-only cookie
  return {};
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await fetch(`${API_URL}/auth/login`, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return handleResponse<AuthResponse>(response);
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
      const response = await fetch(`${API_URL}/auth/register`, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return handleResponse<AuthResponse>(response);
    },

    getProfile: async (): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/me`, {
        ...getDefaultFetchOptions(),
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      return handleResponse<User>(response);
    },

    updateProfile: async (profileData: ProfileUpdateData): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/me`, {
        ...getDefaultFetchOptions(),
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      return handleResponse<User>(response);
    },
  },

  // Prompts
  prompts: {
    getAll: async (): Promise<Prompt[]> => {
      const response = await fetch(`${API_URL}/prompts`, {
        ...getDefaultFetchOptions(),
        headers: getAuthHeaders(),
      });
      return handleResponse<Prompt[]>(response);
    },

    get: async (id: string): Promise<Prompt> => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        ...getDefaultFetchOptions(),
        headers: getAuthHeaders(),
      });
      return handleResponse<Prompt>(response);
    },

    create: async (promptData: PromptData): Promise<Prompt> => {
      const response = await fetch(`${API_URL}/prompts`, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      return handleResponse<Prompt>(response);
    },

    update: async (
      id: string,
      promptData: Partial<PromptData>
    ): Promise<Prompt> => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        ...getDefaultFetchOptions(),
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });
      return handleResponse<Prompt>(response);
    },

    delete: async (id: string): Promise<boolean> => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        ...getDefaultFetchOptions(),
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<boolean>(response);
    },
  },

  // Responses
  responses: {
    getAll: async (promptId: string): Promise<ApiResponse[]> => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses`, {
        ...getDefaultFetchOptions(),
        headers: getAuthHeaders(),
      });
      return handleResponse<ApiResponse[]>(response);
    },

    get: async (promptId: string, responseId: string): Promise<ApiResponse> => {
      const response = await fetch(
        `${API_URL}/prompts/${promptId}/responses/${responseId}`,
        {
          ...getDefaultFetchOptions(),
          headers: getAuthHeaders(),
        }
      );
      return handleResponse<ApiResponse>(response);
    },

    create: async (
      promptId: string,
      responseData: ResponseData
    ): Promise<ApiResponse> => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses`, {
        ...getDefaultFetchOptions(),
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseData),
      });
      return handleResponse<ApiResponse>(response);
    },

    update: async (
      promptId: string,
      responseId: string,
      responseData: Partial<ResponseData>
    ): Promise<ApiResponse> => {
      const response = await fetch(
        `${API_URL}/prompts/${promptId}/responses/${responseId}`,
        {
          ...getDefaultFetchOptions(),
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(responseData),
        }
      );
      return handleResponse<ApiResponse>(response);
    },

    delete: async (promptId: string, responseId: string): Promise<boolean> => {
      const response = await fetch(
        `${API_URL}/prompts/${promptId}/responses/${responseId}`,
        {
          ...getDefaultFetchOptions(),
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );
      return handleResponse<boolean>(response);
    },
  },
};
