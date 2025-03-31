import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export const AuthContext = createContext(null);

// Create a default user if none exists
const ensureDefaultUser = () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    const defaultUser = {
      id: crypto.randomUUID(),
      email: 'default@codex.local',
      name: 'Default User',
      lastLoginAt: new Date().toISOString(),
      isPersistent: true
    };
    localStorage.setItem('user', JSON.stringify(defaultUser));
    return defaultUser;
  }
  return JSON.parse(storedUser);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always ensure a user exists in localStorage
    const currentUser = ensureDefaultUser();
    setUser(currentUser);
    
    // Update last login time
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        lastLoginAt: new Date().toISOString()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store user in localStorage with persistence flag
    const persistentUser = {
      ...userData,
      lastLoginAt: new Date().toISOString(),
      isPersistent: true
    };
    localStorage.setItem('user', JSON.stringify(persistentUser));
    setUser(persistentUser);
    return true;
  };

  const register = (userData) => {
    // Store user in localStorage with persistence flag
    const newUser = {
      ...userData,
      id: crypto.randomUUID(),
      lastLoginAt: new Date().toISOString(),
      isPersistent: true
    };
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    return true;
  };

  const logout = () => {
    // Instead of removing user, we'll just create a new default user
    // This ensures prompts are still accessible
    const defaultUser = ensureDefaultUser();
    setUser(defaultUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: true // Always authenticated with default user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}