import { h, JSX } from 'preact';
import { useState, useContext } from 'preact/hooks';
import { AuthContext } from '../../context/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface FormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export default function LoginForm({
  onSuccess,
  onRegisterClick,
}: LoginFormProps): JSX.Element {
  const auth = useContext(AuthContext);
  const [formData, setFormData] = useState<FormData>({
    email: 'alice@example.com',
    password: 'password123',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!auth) {
        throw new Error('Authentication context not available');
      }

      const result = await auth.login(formData.email, formData.password);

      console.log('Login result:', result);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else if (result.requiresVerification) {
        // User needs to verify email - handled by parent component
        console.log('Email verification required');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleLoginButton />
          </div>
        </div>
      </form>

      <div className="mt-6">
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
          </span>
          <button
            onClick={onRegisterClick}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Register now
          </button>
        </div>
      </div>
    </div>
  );
}