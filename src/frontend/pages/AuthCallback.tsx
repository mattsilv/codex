import { h, JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import useToast from '../hooks/useToast';

/**
 * Handles the OAuth callback from Google
 * The backend redirects here after Google authentication and sets HTTP-only cookies
 */
export default function AuthCallback(): JSX.Element {
  const [status, setStatus] = useState<string>('Processing login...');
  const { showToast } = useToast();

  useEffect(() => {
    const processCallback = (): void => {
      console.log('Auth callback processing. URL:', window.location.href);
      
      // The backend has already set the session cookie
      // We just need to show a success message and redirect
      
      setStatus('Login successful! Redirecting...');
      showToast('Login successful! Redirecting to dashboard...', 'success');
      
      // Use a small delay to ensure state updates have time to process
      setTimeout(() => {
        // Redirect to the dashboard
        console.log('Redirecting to dashboard');
        
        // Use window.location for a full page reload
        window.location.href = '/dashboard';
      }, 500);
    };

    processCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Authentication</h1>
        
        <div className="my-8">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
}