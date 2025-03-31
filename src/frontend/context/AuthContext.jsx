import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { authAPI } from '../utils/api';
import { STORAGE_KEYS } from '@shared/constants';

export const AuthContext = createContext(null);

// Create a default user if none exists (for backward compatibility)
const ensureDefaultUser = () => {
  const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
  
  if (!storedToken || !storedUser) {
    const defaultUser = {
      id: crypto.randomUUID(),
      email: 'default@codex.local',
      username: 'Default User',
      lastLoginAt: new Date().toISOString(),
      isPersistent: true
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    return defaultUser;
  }
  
  return JSON.parse(storedUser);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for token first
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      // Try to get user from the API
      authAPI.getProfile()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        })
        .catch((err) => {
          console.error("Failed to validate token:", err);
          // If API fails, fall back to stored user or create default
          const currentUser = ensureDefaultUser();
          setUser(currentUser);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // No token, use default user
      const currentUser = ensureDefaultUser();
      setUser(currentUser);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.login(email, password);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await authAPI.register(username, email, password);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      await authAPI.updateProfile(userData);
      
      // Update local user state by merging with existing user data
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      
      setLoading(false);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    authAPI.logout();
    
    // Create new default user to maintain local functionality
    const defaultUser = ensureDefaultUser();
    setUser(defaultUser);
  };

  // For compatibility with the existing app during transition
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}