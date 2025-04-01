import { h, JSX } from 'preact';
import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { validateEmail } from '../../utils/auth';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

export default function LoginForm(): JSX.Element {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: JSX.TargetedEvent<HTMLInputElement, Event>
  ): void => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors as user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        form: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: JSX.TargetedEvent<HTMLFormElement, Event>
  ): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      console.log('Attempting login for:', formData.email);
      const success = await login(formData.email, formData.password);

      if (success) {
        showSuccess('Login successful! Redirecting to dashboard...');
        route('/dashboard');
      } else {
        setErrors({
          form: 'Login failed. Please check your credentials and try again.',
        });
        showError('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        form: 'Login failed. Please try again.',
      });
      showError(`Login error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Login</h2>

      {errors.form && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
          {errors.form}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        error={errors.email}
      />

      <Input
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
        error={errors.password}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
