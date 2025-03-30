import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // For MVP: Store user in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return true;
  };

  const register = (userData) => {
    // For MVP: Store user in localStorage
    localStorage.setItem('user', JSON.stringify({
      ...userData,
      id: crypto.randomUUID()
    }));
    setUser(userData);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}