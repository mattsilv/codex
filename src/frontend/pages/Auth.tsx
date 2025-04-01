import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { API_URL } from '../utils/api';
import { migrateLegacyData } from '../utils/migrateLegacyData';
import { AuthContext } from '../context/AuthContext';
import useToast from '../hooks/useToast';

interface MigrationStatus {
  success: boolean;
  message: string;
}

interface ApiStatus {
  message: string;
  working: boolean | null;
}

export default function Auth(): JSX.Element {
  const { user, login, register, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] =
    useState<MigrationStatus | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    message: `API URL: ${API_URL}`,
    working: null,
  });

  // Check if the backend API is reachable
  useEffect(() => {
    const checkApi = async (): Promise<void> => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/seed-test-data`);
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

      // Try direct API call instead of using context methods
      const endpoint = isLogin ? 'login' : 'register';
      console.log(`Making direct fetch to ${API_URL}/auth/${endpoint}`);

      const payload = isLogin
        ? { email, password }
        : { email, username, password };

      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Direct API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Direct API error response:', errorData);
        setError(errorData.error || `API error: ${response.status}`);
        return;
      }

      // Success path
      const data = await response.json();
      console.log('Direct API success response:', data);

      // Store auth data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      // Try to migrate data
      console.log('Authentication successful, attempting data migration');
      const result = await migrateLegacyData();
      setMigrationStatus(result as MigrationStatus);
      console.log('Migration result:', result);

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'; // Force full page reload
      }, 2000);
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

      // Try a simple POST request to test the login endpoint directly
      const testResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'password123',
        }),
      });

      let resultText: string;
      try {
        const result = await testResponse.json();
        resultText = JSON.stringify(result).substring(0, 100);
      } catch (e) {
        resultText = await testResponse.text();
      }

      setApiStatus({
        message: `API login test (status ${testResponse.status}): ${resultText}${resultText.length > 100 ? '...' : ''}`,
        working: testResponse.ok,
      });
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
              {apiStatus.message}
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

        {migrationStatus && (
          <div
            className={
              migrationStatus.success ? 'success-message' : 'error-message'
            }
            style={{
              color: migrationStatus.success ? 'green' : 'red',
              margin: '1rem 0',
              padding: '0.5rem',
              backgroundColor: migrationStatus.success ? '#e8f5e9' : '#ffebee',
              borderRadius: '4px',
            }}
          >
            {migrationStatus.message}
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
