import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { API_URL } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import useToast from '../hooks/useToast';
import { GoogleLoginButton } from '../components/auth/GoogleLoginButton';

interface ApiStatus {
  message: string;
  working: boolean | null;
}

export default function Auth(): JSX.Element {
  const { user, login, register, isAuthenticated, loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    message: `API URL: ${API_URL}`,
    working: null,
  });

  // Check if the backend API is reachable
  useEffect(() => {
    const checkApi = async (): Promise<void> => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/health`);
        const endTime = Date.now();

        if (response.ok) {
          setApiStatus({
            message: `API is reachable (${endTime - startTime}ms)`,
            working: true,
          });
        } else {
          setApiStatus({
            message: `API returned status ${response.status} (${endTime - startTime}ms)`,
            working: false,
          });
        }
      } catch (err) {
        console.error('API check failed:', err);
        setApiStatus({
          message: `API connection error: ${(err as Error).message}`,
          working: false,
        });
      }
    };

    checkApi();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      route('/dashboard');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (
    e: JSX.TargetedEvent<HTMLFormElement, Event>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear any previous errors

    if (!email) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setIsSubmitting(false);
      return;
    }

    if (!isLogin && !username) {
      setError('Username is required');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Auth form submission:', {
        isLogin,
        email,
        username,
        password: '******',
      });

      // Use the context methods for login/register instead of direct API calls
      // This ensures proper cookie handling and state management
      let result;
      
      if (isLogin) {
        console.log('Using AuthContext login method');
        result = await login(email, password);
      } else {
        console.log('Using AuthContext register method');
        result = await register(email, username, password);
      }
      
      console.log('Auth operation result:', result);

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        return;
      }
      
      // Success - AuthContext will manage the authenticated state via cookies
      // The useEffect watching isAuthenticated will handle redirection
      console.log('Authentication successful, waiting for redirect');
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(`Network error: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = (): void => {
    setIsLogin(!isLogin);
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const testApi = async (): Promise<void> => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      console.log('=== AUTHENTICATION TEST SUITE ===');
      
      // 1. First test the health endpoint
      console.log('\n📡 Testing API Health');
      console.log(`Endpoint: ${API_URL}/health`);
      
      try {
        const healthResponse = await fetch(`${API_URL}/health`, {
          credentials: 'include',
          mode: 'cors',
          cache: 'no-cache' // Don't cache health checks
        });
        
        console.log(`Health check status: ${healthResponse.status}`);
        
        if (healthResponse.ok) {
          console.log('✅ Health endpoint reachable');
        } else {
          console.warn(`⚠️ Health endpoint returned ${healthResponse.status}`);
        }
      } catch (healthError) {
        console.error('❌ Health check failed:', healthError);
      }
      
      // 2. Test the authentication endpoint directly
      console.log('\n🔐 Testing Authentication API');
      console.log(`Endpoint: ${API_URL}/auth/me`);
      
      try {
        const authResponse = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
          mode: 'cors'
        });
        
        console.log(`Auth check status: ${authResponse.status}`);
        console.log('Headers received:', Object.fromEntries(authResponse.headers.entries()));
        
        if (authResponse.ok) {
          const userData = await authResponse.json();
          console.log('✅ Already authenticated as:', userData.email);
          setApiStatus({
            message: `Already authenticated as: ${userData.email}`,
            working: true,
          });
          return;
        } else {
          console.log('Not currently authenticated, proceeding to login test');
        }
      } catch (authError) {
        console.error('❌ Auth check failed:', authError);
      }
      
      // 3. Test a login request with proper CORS settings
      console.log('\n🔑 Testing Login API');
      console.log(`Endpoint: ${API_URL}/auth/login`);
      
      try {
        // Use the context login method
        console.log('Attempting login via AuthContext...');
        const result = await login('alice@example.com', 'password123');
        
        if (result.success) {
          console.log('✅ Login successful via AuthContext');
          setApiStatus({
            message: 'Login successful! Cookie-based authentication is working properly.',
            working: true,
          });
        } else {
          console.error('❌ Login failed via AuthContext:', result.error);
          setApiStatus({
            message: `Login failed: ${result.error}`,
            working: false,
          });
        }
      } catch (loginError) {
        console.error('❌ Login test failed:', loginError);
        setApiStatus({
          message: `Login test error: ${(loginError as Error).message}`,
          working: false,
        });
      }
    } catch (err) {
      console.error('API test error:', err);
      setApiStatus({
        message: `API test error: ${(err as Error).message}`,
        working: false,
      });
      setError(`API test error: ${(err as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container"
      style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 0' }}
    >
      <div className="auth-container">
        <h1>{isLogin ? 'Login' : 'Create Account'}</h1>

        {/* Only show test API connection button in development */}
        {!window.location.hostname.includes('codex.silv.app') &&
          !window.location.hostname.includes('codex-abq.pages.dev') && (
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Button onClick={testApi} disabled={isSubmitting}>
                Test API Connection
              </Button>
            </div>
          )}

        {/* Only show API status in development */}
        {apiStatus &&
          !window.location.hostname.includes('codex.silv.app') &&
          !window.location.hostname.includes('codex-abq.pages.dev') && (
            <div
              className={
                apiStatus.working === true
                  ? 'success-message'
                  : apiStatus.working === false
                    ? 'error-message'
                    : 'info-message'
              }
              style={{
                color:
                  apiStatus.working === true
                    ? 'green'
                    : apiStatus.working === false
                      ? 'red'
                      : 'blue',
                margin: '1rem 0',
                padding: '0.5rem',
                backgroundColor:
                  apiStatus.working === true
                    ? '#e8f5e9'
                    : apiStatus.working === false
                      ? '#ffebee'
                      : '#e3f2fd',
                borderRadius: '4px',
              }}
            >
              {apiStatus.message || 'Checking API status...'}
            </div>
          )}

        {error && (
          <div
            className="error-message"
            style={{
              color: 'red',
              margin: '1rem 0',
              padding: '0.5rem',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="alice@example.com"
              required
              disabled={isSubmitting}
            />
            <small
              style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}
            >
              {isLogin &&
              !window.location.hostname.includes('codex.silv.app') &&
              !window.location.hostname.includes('codex-abq.pages.dev')
                ? 'Try: alice@example.com'
                : 'Enter your email address'}
            </small>
          </div>

          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="username">Username</label>
              <Input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.currentTarget.value)}
                placeholder="your_username"
                required
                disabled={isSubmitting}
              />
              <small
                style={{
                  display: 'block',
                  marginTop: '0.25rem',
                  color: '#666',
                }}
              >
                Choose a username (at least 3 characters)
              </small>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="password123"
              required
              disabled={isSubmitting}
            />
            <small
              style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}
            >
              {isLogin &&
              !window.location.hostname.includes('codex.silv.app') &&
              !window.location.hostname.includes('codex-abq.pages.dev')
                ? 'Try: password123'
                : isLogin
                  ? 'Enter your password'
                  : 'Choose a secure password (at least 8 characters)'}
            </small>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Processing...'
                : isLogin
                  ? 'Login'
                  : 'Create Account'}
            </Button>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toggleAuthMode();
              }}
            >
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </a>
          </div>
          
          {/* OAuth login options */}
          <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ textAlign: 'center', color: '#666' }}>
              <span>or</span>
            </div>
            
            {/* Import the GoogleLoginButton component */}
            <GoogleLoginButton />
          </div>
        </form>

        {/* Only show test users in development */}
        {isLogin &&
          !window.location.hostname.includes('codex.silv.app') &&
          !window.location.hostname.includes('codex-abq.pages.dev') && (
            <div style={{ marginTop: '2rem' }}>
              <h3>Test Users:</h3>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                }}
              >
                <p>
                  <strong>Email:</strong> alice@example.com
                </p>
                <p>
                  <strong>Password:</strong> password123
                </p>
              </div>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: '0.75rem',
                  borderRadius: '4px',
                }}
              >
                <p>
                  <strong>Email:</strong> bob@example.com
                </p>
                <p>
                  <strong>Password:</strong> password123
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
