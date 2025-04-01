import { h, createContext, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { API_URL } from '../utils/api';

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified?: boolean;
  requiresVerification?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // For any additional properties
}

export interface AuthResponse {
  success: boolean;
  requiresVerification?: boolean;
  email?: string;
  expiresAt?: string;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  loginWithGoogle: () => Promise<any>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<AuthResponse>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  isAuthenticated: boolean;
}

export interface AuthProviderProps {
  children: JSX.Element | JSX.Element[] | string;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state by checking with the server
  useEffect(() => {
    console.log('AuthContext initializing - fetching auth state from server');
    
    // Fetch the current user from the server
    // The session cookie will be automatically included
    fetch(`${API_URL}/auth/me`, {
      credentials: 'include', // Important: include cookies in the request
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        return res.json();
      })
      .then((userData: User) => {
        console.log('Server authenticated user:', userData.email);
        setUser(userData);
      })
      .catch((err) => {
        console.log('Not authenticated or auth error:', err.message);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    setError(null);
    try {
      console.log(
        'AuthContext: Sending login request to',
        `${API_URL}/auth/login`
      );
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important: include cookies in the request
      });

      console.log('AuthContext: Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext: Login error response:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      console.log('AuthContext: Login success, user data:', data.user);
      setUser(data.user);

      return { success: true };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      const error = err as Error;
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async (): Promise<any> => {
    setError(null);
    try {
      // Request Google auth URL from our backend
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Google login initialization failed');
      }

      const result = await response.json();
      console.log('AuthContext: Received OAuth initialization result:', result);
      
      // Instead of immediately redirecting, return the result
      // to let the button component handle the redirect
      return result;
      
      // The rest of the auth flow will be handled when Google redirects back
      // to our callback endpoint, which will set the auth state
    } catch (err) {
      console.error('AuthContext: Google login error:', err);
      const error = err as Error;
      setError(error.message);
      throw error; // Re-throw to allow component to handle it
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    setError(null);
    try {
      console.log(
        'AuthContext: Sending registration request to',
        `${API_URL}/auth/register`
      );
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include', // Important: include cookies in the request
      });

      console.log(
        'AuthContext: Registration response status:',
        response.status
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch((e) => ({ error: 'Server returned an invalid response' }));
        console.error('AuthContext: Registration error response:', errorData);
        throw new Error(errorData.error || 'Registration failed');
      }

      const data = await response.json();
      console.log('AuthContext: Registration success, user data:', data.user);

      // Set user data
      setUser(data.user);

      return { success: true };
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      const error = err as Error;
      setError(error.message);
      // Return the error instead of throwing
      return { success: false, error: error.message };
    }
  };

  const logout = (): void => {
    // Call logout endpoint to invalidate session
    fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Important: include cookies in the request
    })
    .then(() => {
      console.log('Successfully logged out on server');
    })
    .catch(err => {
      console.error('Error logging out:', err);
    })
    .finally(() => {
      // Clear local state regardless of server response
      setUser(null);
    });
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    setError(null);
    try {
      console.log('AuthContext: Sending profile update request');

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Important: include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext: Profile update error response:', errorData);
        throw new Error(errorData.error || 'Profile update failed');
      }

      // If password was changed, we don't get updated user data
      // For email/username changes, refresh the user data
      if (userData.email || userData.username) {
        // Get updated user data
        const userResponse = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include', // Include cookies
        });

        if (userResponse.ok) {
          const updatedUserData = await userResponse.json();
          setUser(updatedUserData);
        }
      }

      return true;
    } catch (err) {
      console.error('AuthContext: Profile update error:', err);
      const error = err as Error;
      setError(error.message);
      return false;
    }
  };

  // Delete user account
  const deleteAccount = async (): Promise<boolean> => {
    setError(null);
    try {
      console.log('AuthContext: Sending account deletion request');

      const response = await fetch(`${API_URL}/auth/delete`, {
        method: 'DELETE',
        credentials: 'include', // Important: include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(
          'AuthContext: Account deletion error response:',
          errorData
        );
        throw new Error(errorData.error || 'Account deletion failed');
      }

      // Logout after successful deletion
      logout();
      return true;
    } catch (err) {
      console.error('AuthContext: Account deletion error:', err);
      const error = err as Error;
      setError(error.message);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}