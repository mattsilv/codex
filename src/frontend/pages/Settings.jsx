import { useContext, useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import useToast from '../hooks/useToast';

export default function Settings() {
  const { user, login, logout, updateProfile } = useContext(AuthContext);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Load user data into the form
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (formData.password && formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare update data
      const updateData = {};
      if (formData.username !== user.username)
        updateData.username = formData.username;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;

      // Only make API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const success = await updateProfile(updateData);

        if (success) {
          showToast('Profile updated successfully', 'success');

          // Clear password fields
          setFormData((prev) => ({
            ...prev,
            password: '',
            confirmPassword: '',
          }));
        } else {
          showToast('Failed to update profile', 'error');
        }
      } else {
        showToast('No changes to save', 'info');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showToast('Please type DELETE to confirm account deletion', 'error');
      return;
    }

    setIsDeletingAccount(true);

    try {
      // Make API call to delete user account
      // Import API_URL from shared constants
      const API_URL = await import('../utils/api').then(module => module.API_URL);
      const response = await fetch(
        `${API_URL}/auth/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast(
          'Account has been scheduled for deletion and will be permanently removed in 7 days',
          'info'
        );

        // Close modal and logout
        setShowDeleteModal(false);

        // Give user time to read the toast before logging out
        setTimeout(() => {
          logout();
          route('/');
        }, 2000);
      } else {
        showToast(`Failed to delete account: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      showToast('Error deleting account: ' + error.message, 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div>
      <h1>Account Settings</h1>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <Input
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
            />
            <p className="text-xs text-muted mt-xs">
              This will be displayed in the header and when sharing prompts.
            </p>
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
            <p className="text-xs text-muted mt-xs">
              etc.) will be permanently deleted. This action can&apos;t be
            </p>
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
            <p className="text-xs text-muted mt-xs">
              Leave blank to keep your current password.
            </p>
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

          <div className="flex-between">
            <Button
              type="button"
              className="btn-error"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <Modal title="Delete Account" onClose={() => setShowDeleteModal(false)}>
          <div className="mb-lg">
            <p className="mb-sm">
              This action will schedule your account for deletion. After 7 days,
              all your data will be permanently deleted and cannot be recovered.
            </p>
            <p className="mb-sm">
              To confirm this irreversible action, please type{' '}
              <strong>DELETE</strong> below:
            </p>

            <Input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>

          <div className="flex-between">
            <Button
              type="button"
              className="btn-neutral"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-error"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
