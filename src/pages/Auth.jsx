import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { migrateLocalData, API_URL } from '../utils/api';

export default function Auth() {
  const { user, login, register, error, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [apiStatus, setApiStatus] = useState({ message: `API URL: ${API_URL}`, working: null });
  
  // Check if the backend API is reachable
  useEffect(() => {
    const checkApi = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(`${API_URL}/seed-test-data`);
        const endTime = Date.now();
        
        if (response.ok) {
          setApiStatus({ 
            message: `API is reachable (${endTime - startTime}ms)`, 
            working: true 
          });
        } else {
          setApiStatus({ 
            message: `API returned status ${response.status} (${endTime - startTime}ms)`, 
            working: false 
          });
        }
      } catch (err) {
        console.error('API check failed:', err);
        setApiStatus({ 
          message: `API connection error: ${err.message}`, 
          working: false 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Auth form submission:', { isLogin, email, username, password: '******' });
      
      // Try direct API call instead of using context methods
      const endpoint = isLogin ? 'login' : 'register';
      console.log(`Making direct fetch to ${API_URL}/auth/${endpoint}`);
      
      const payload = isLogin 
        ? { email, password } 
        : { email, username, password };
        
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
      
      setError(null);
      
      // Try to migrate data
      console.log('Authentication successful, attempting data migration');
      const result = await migrateLocalData();
      setMigrationStatus(result);
      console.log('Migration result:', result);
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';  // Force full page reload
      }, 2000);
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setUsername('');
    setPassword('');
  };

  const testApi = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      // Try a simple POST request to test the login endpoint directly
      const testResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'alice@example.com',
          password: 'password123'
        })
      });
      
      let resultText;
      try {
        const result = await testResponse.json();
        resultText = JSON.stringify(result).substring(0, 100);
      } catch (e) {
        resultText = await testResponse.text();
      }
      
      setApiStatus({
        message: `API login test (status ${testResponse.status}): ${resultText}${resultText.length > 100 ? '...' : ''}`,
        working: testResponse.ok
      });
    } catch (err) {
      setApiStatus({
        message: `API test error: ${err.message}`,
        working: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem 0' }}>
      <div className="auth-container">
        <h1>{isLogin ? 'Login' : 'Create Account'}</h1>
        
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <Button onClick={testApi} disabled={isSubmitting}>Test API Connection</Button>
        </div>
        
        {apiStatus && (
          <div 
            className={apiStatus.working === true ? 'success-message' : apiStatus.working === false ? 'error-message' : 'info-message'}
            style={{ 
              color: apiStatus.working === true ? 'green' : apiStatus.working === false ? 'red' : 'blue', 
              margin: '1rem 0', 
              padding: '0.5rem', 
              backgroundColor: apiStatus.working === true ? '#e8f5e9' : apiStatus.working === false ? '#ffebee' : '#e3f2fd', 
              borderRadius: '4px' 
            }}
          >
            {apiStatus.message}
          </div>
        )}
      
        {error && (
          <div className="error-message" style={{ color: 'red', margin: '1rem 0', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            {error}
          </div>
        )}
        
        {migrationStatus && (
          <div 
            className={migrationStatus.success ? 'success-message' : 'error-message'} 
            style={{ 
              color: migrationStatus.success ? 'green' : 'red', 
              margin: '1rem 0', 
              padding: '0.5rem', 
              backgroundColor: migrationStatus.success ? '#e8f5e9' : '#ffebee', 
              borderRadius: '4px' 
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
              type="email" 
              value={email} 
              onInput={(e) => setEmail(e.target.value)} 
              placeholder="alice@example.com"
              required 
              disabled={isSubmitting}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
              {isLogin ? 'Try: alice@example.com' : 'Enter your email address'}
            </small>
          </div>
          
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="username">Username</label>
              <Input 
                id="username"
                type="text" 
                value={username} 
                onInput={(e) => setUsername(e.target.value)} 
                placeholder="your_username"
                required 
                disabled={isSubmitting}
              />
              <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
                Choose a username (at least 3 characters)
              </small>
            </div>
          )}
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password">Password</label>
            <Input 
              id="password"
              type="password" 
              value={password} 
              onInput={(e) => setPassword(e.target.value)} 
              placeholder="password123"
              required 
              disabled={isSubmitting}
            />
            <small style={{ display: 'block', marginTop: '0.25rem', color: '#666' }}>
              {isLogin ? 'Try: password123' : 'Choose a secure password (at least 8 characters)'}
            </small>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </Button>
            
            <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>
              {isLogin ? 'Need an account?' : 'Already have an account?'}
            </a>
          </div>
        </form>
        
        {isLogin && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Test Users:</h3>
            <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
              <p><strong>Email:</strong> alice@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
            <div style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: '4px' }}>
              <p><strong>Email:</strong> bob@example.com</p>
              <p><strong>Password:</strong> password123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}