import { createContext } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { API_URL } from '../utils/api';

export const AuthContext = createContext(null);

// Check for stored auth token
const getStoredAuth = () => {
  const storedToken = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('authUser');
  if (storedToken && storedUser) {
    try {
      return {
        token: storedToken,
        user: JSON.parse(storedUser)
      };
    } catch (e) {
      console.error('Failed to parse stored user', e);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    }
  }
  return null;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we have stored auth credentials
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
      
      // Verify the token is still valid with the server
      fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${storedAuth.token}`
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Token invalid');
          }
          return res.json();
        })
        .then(userData => {
          // Update user data if needed
          setUser(userData);
          localStorage.setItem('authUser', JSON.stringify(userData));
        })
        .catch(err => {
          console.error('Failed to validate token:', err);
          // Clear invalid auth data
          setUser(null);
          setToken(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      console.log('AuthContext: Sending login request to', `${API_URL}/auth/login`);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
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
      setToken(data.token);
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      return true;
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message);
      return false;
    }
  };

  const register = async (email, username, password) => {
    setError(null);
    try {
      console.log('AuthContext: Sending registration request to', `${API_URL}/auth/register`);
      console.log('AuthContext: Registration payload:', { email, username, password: '******' });
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, username, password })
      });
      
      console.log('AuthContext: Registration response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext: Registration error response:', errorData);
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const data = await response.json();
      console.log('AuthContext: Registration success, user data:', data.user);
      setUser(data.user);
      setToken(data.token);
      
      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      return true;
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value = {
    user,
    token,
    loading,
    error,
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