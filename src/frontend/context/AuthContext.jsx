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
        user: JSON.parse(storedUser),
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
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    // Check if we have stored auth credentials
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);

      // Verify the token is still valid with the server
      fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${storedAuth.token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Token invalid');
          }
          return res.json();
        })
        .then((userData) => {
          // Update user data if needed
          setUser(userData);
          localStorage.setItem('authUser', JSON.stringify(userData));
        })
        .catch((err) => {
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
    setVerificationData(null);
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
      });

      console.log('AuthContext: Login response status:', response.status);

      // Handle email verification requirements
      if (response.status === 401) {
        const errorData = await response.json();
        console.log('AuthContext: Login response data:', errorData);

        if (errorData.requiresVerification) {
          // Store verification data
          setVerificationData({
            email: errorData.email,
            expiresAt: errorData.expiresAt,
            message: errorData.message,
          });

          return {
            success: false,
            requiresVerification: true,
            email: errorData.email,
            expiresAt: errorData.expiresAt,
          };
        } else {
          console.error('AuthContext: Login error response:', errorData);
          throw new Error(errorData.error || 'Login failed');
        }
      }

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

      return { success: true };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (email, username, password) => {
    setError(null);
    setVerificationData(null);
    try {
      console.log(
        'AuthContext: Sending registration request to',
        `${API_URL}/auth/register`
      );
      console.log('AuthContext: Registration payload:', {
        email,
        username,
        password: '******',
      });

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
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

      // Check if verification is required
      if (data.user && data.user.requiresVerification) {
        setVerificationData({
          email: data.user.email,
          expiresAt: data.verificationStatus?.expiresAt,
          message: 'Please verify your email to continue',
        });

        // Store token and user temporarily
        setUser(data.user);
        setToken(data.token);

        // Store auth data temporarily
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUser', JSON.stringify(data.user));

        return {
          success: true,
          requiresVerification: true,
          email: data.user.email,
          expiresAt: data.verificationStatus?.expiresAt,
        };
      }

      // Standard registration success
      setUser(data.user);
      setToken(data.token);

      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      setError(err.message);
      // Return the error instead of throwing
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      console.log('AuthContext: Sending profile update request');

      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const updatedUserData = await userResponse.json();
          setUser(updatedUserData);
          localStorage.setItem('authUser', JSON.stringify(updatedUserData));
        }
      }

      return true;
    } catch (err) {
      console.error('AuthContext: Profile update error:', err);
      setError(err.message);
      return false;
    }
  };

  // Delete user account
  const deleteAccount = async () => {
    setError(null);
    try {
      console.log('AuthContext: Sending account deletion request');

      const response = await fetch(`${API_URL}/auth/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      setError(err.message);
      return false;
    }
  };

  // Verify email with code
  const verifyEmail = async (email, code) => {
    setError(null);
    try {
      console.log('AuthContext: Sending email verification request');

      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext: Verification error response:', errorData);
        throw new Error(errorData.error || 'Email verification failed');
      }

      const data = await response.json();
      console.log('AuthContext: Verification success, user data:', data.user);

      // Update user and token
      setUser(data.user);
      setToken(data.token);

      // Update stored auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      // Clear verification data
      setVerificationData(null);

      return { success: true };
    } catch (err) {
      console.error('AuthContext: Email verification error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Resend verification code
  const resendVerificationCode = async (email) => {
    setError(null);
    try {
      console.log('AuthContext: Resending verification code');

      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('AuthContext: Resend verification error:', errorData);
        throw new Error(
          errorData.error || 'Failed to resend verification code'
        );
      }

      const data = await response.json();

      if (data.expiresAt) {
        setVerificationData({
          ...verificationData,
          expiresAt: data.expiresAt,
          message: 'A new verification code has been sent to your email',
        });
      }

      return { success: true, expiresAt: data.expiresAt };
    } catch (err) {
      console.error('AuthContext: Resend verification error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    verifyEmail,
    resendVerificationCode,
    verificationData,
    isAuthenticated:
      !!user && (!user.requiresVerification || user.emailVerified),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
