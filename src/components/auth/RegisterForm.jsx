import { useState } from 'preact/hooks';
import { route } from 'preact-router';
import Input from '../ui/Input';
import Button from '../ui/Button';
import useAuth from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/auth';

export default function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
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
      
      const success = register({
        username,
        email: formData.email
      });
      
      if (success) {
        route('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        form: 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      
      {errors.form && (
        <div className="error">{errors.form}</div>
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
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
}