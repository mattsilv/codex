import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { validateEmail, validatePassword } from '../../utils/auth';

export default function RegisterForm() {
  const { register } = useAuth();
  const { showError, showSuccess } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
        form: undefined,
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Use the enhanced password validation
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Generate a username from the email for internal use
      const username = formData.email.split('@')[0];

      console.log('Attempting registration for:', formData.email);

      try {
        const result = await register(
          formData.email,
          username,
          formData.password
        );

        if (result.success) {
          // Check if verification is required
          if (result.requiresVerification) {
            showSuccess(
              'Registration successful! Please check your email for verification code.'
            );
            route('/verify'); // Add this route if not already implemented
          } else {
            showSuccess('Registration successful! Redirecting to dashboard...');
            route('/dashboard');
          }
        } else {
          // Handle specific error messages from the API
          const errorMessage =
            result.error ||
            'Registration failed. Please try again with a different email.';
          setErrors({
            form: errorMessage,
          });
          showError(errorMessage);
        }
      } catch (apiError) {
        console.error('API connection error:', apiError);

        // Check if it's a network error (likely backend not running)
        if (apiError.message && apiError.message.includes('Failed to fetch')) {
          const errorMsg =
            'Cannot connect to the server. Please make sure the backend is running.';
          setErrors({
            form: errorMsg,
          });
          showError(errorMsg);
        } else {
          const errorMsg = `Registration failed: ${apiError.message}`;
          setErrors({
            form: errorMsg,
          });
          showError(errorMsg);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        form: 'Registration failed. Please try again.',
      });
      showError(`Registration error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900">Register</h2>

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
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
}
