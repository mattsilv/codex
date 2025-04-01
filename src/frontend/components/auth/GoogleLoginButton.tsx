import { h, JSX } from 'preact';
import { useContext, useState } from 'preact/hooks';
import { AuthContext } from '../../context/AuthContext';
import { API_URL } from '../../utils/api';

interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className = '' }: GoogleLoginButtonProps): JSX.Element {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    if (!auth) return;
    
    setLoading(true);
    try {
      console.log('Starting Google login flow');
      
      // Log fetch details before the call
      console.log('Will request from endpoint:', `${API_URL}/auth/google`);
      // Log fetch details before the call
      console.log('Will fetch from Google OAuth endpoint directly');
      
      // Make direct fetch to avoid any potential issues with the auth context
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get Google auth URL: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Direct fetch result:', result);
      
      // Only use auth context as fallback if direct fetch fails
      if (!result || !result.url) {
        console.log('Falling back to auth context loginWithGoogle');
        const authResult = await auth.loginWithGoogle();
        // Replace result with authResult
        Object.assign(result, authResult);
      }
      
      console.log('Final result for redirect:', result);
      
      // If we get a URL directly in the response, use it for redirection
      if (result && typeof result === 'object' && result.url) {
        // Use the raw JSON in a more visible way for debugging
        const jsonResult = JSON.stringify(result);
        console.log('Received OAuth URL in JSON format:', jsonResult);
        console.log('Redirecting to URL:', result.url);
        
        // Add a slight delay to make sure logs appear in console
        setTimeout(() => {
          // Use window.location.assign for more reliable navigation
          window.location.assign(result.url);
          // Alternative approach if the above doesn't work
          // const link = document.createElement('a');
          // link.href = result.url;
          // link.click();
        }, 100);
        
        return; // Don't reset loading since we're leaving the page
      } else {
        console.error('No valid URL returned from loginWithGoogle', typeof result, result);
        throw new Error('Invalid authorization URL');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setLoading(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${className}`}
    >
      {loading ? (
        <span className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></span>
      ) : (
        <>
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z"
              fill="#4285F4"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
}