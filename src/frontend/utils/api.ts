// API client for Codex (TypeScript version)
import { STORAGE_KEYS } from '@shared/constants';

export interface User {
  id: string;
  email: string;
  name: string;
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
  name: string;
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
  name?: string;
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

// Helper function to handle API responses
const handleResponse = async <T>(response: globalThis.Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
};

// Function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Authentication
  auth: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await fetch(`${API_URL}/auth/login`, {
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
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });
      return handleResponse<User>(response);
    },

    updateProfile: async (profileData: ProfileUpdateData): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/me`, {
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
        headers: getAuthHeaders(),
      });
      return handleResponse<Prompt[]>(response);
    },

    get: async (id: string): Promise<Prompt> => {
      const response = await fetch(`${API_URL}/prompts/${id}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<Prompt>(response);
    },

    create: async (promptData: PromptData): Promise<Prompt> => {
      const response = await fetch(`${API_URL}/prompts`, {
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
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      return true;
    },
  },

  // Responses
  responses: {
    getAll: async (promptId: string): Promise<ApiResponse[]> => {
      const response = await fetch(`${API_URL}/prompts/${promptId}/responses`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<ApiResponse[]>(response);
    },

    get: async (promptId: string, responseId: string): Promise<ApiResponse> => {
      const response = await fetch(
        `${API_URL}/prompts/${promptId}/responses/${responseId}`,
        {
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
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Delete failed: ${response.status}`);
      }

      return true;
    },
  },
};
