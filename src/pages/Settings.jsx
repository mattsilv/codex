import { useContext, useState, useEffect } from 'preact/hooks';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Toast from '../components/ui/Toast';

export default function Settings() {
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [toast, setToast] = useState({ message: '', type: '' });
  const [showToast, setShowToast] = useState(false);

  // Load user data into the form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const displayToast = (message, type = 'info') => {
    setToast({ message, type });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      displayToast('Passwords do not match', 'error');
      return;
    }

    // Update user data
    const updatedUser = {
      ...user,
      name: formData.name || user.name,
      email: formData.email || user.email
    };

    // Only update password if provided
    if (formData.password) {
      updatedUser.password = formData.password;
    }

    // Save updated user to localStorage
    login(updatedUser);
    
    // Clear password fields
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
    
    displayToast('Settings updated successfully', 'success');
  };

  return (
    <div>
      <h1>Settings</h1>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <Input
              label="Username"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            <p className="text-xs text-muted mt-xs">This will be displayed in the header and when sharing prompts.</p>
          </div>
          
          <div className="mb-md">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
            <p className="text-xs text-muted mt-xs">Your email is used for identification only and won't be shared.</p>
          </div>
          
          <hr className="mb-md" />
          
          <div className="mb-md">
            <Input
              label="New Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
            <p className="text-xs text-muted mt-xs">Leave blank to keep your current password.</p>
          </div>
          
          <div className="mb-md">
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="flex-end">
            <Button type="submit" className="btn-md">Save Changes</Button>
          </div>
        </form>
      </div>
      
      {showToast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setShowToast(false)} 
        />
      )}
    </div>
  );
}