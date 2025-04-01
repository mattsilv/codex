import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import VerificationForm from '../components/auth/VerificationForm';
import useAuth from '../hooks/useAuth';

export default function Verify({ email = null }) {
  const { verificationData, isAuthenticated } = useAuth();
  const [userEmail, setUserEmail] = useState(email);
  const [expiryTime, setExpiryTime] = useState(null);

  useEffect(() => {
    // If user is already authenticated and email verified, redirect to dashboard
    if (isAuthenticated) {
      route('/dashboard', true);
      return;
    }

    // If email is provided in props, use it
    if (email) {
      setUserEmail(email);
    }
    // Otherwise check for verification data from auth context
    else if (verificationData) {
      setUserEmail(verificationData.email);
      setExpiryTime(verificationData.expiresAt);
    }
    // If neither is available, redirect to login
    else {
      route('/auth?tab=login', true);
    }
  }, [email, verificationData, isAuthenticated]);

  const handleVerificationSuccess = () => {
    // Redirect to dashboard after successful verification
    route('/dashboard', true);
  };

  // Wait until we have the email before rendering the verification form
  if (!userEmail) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VerificationForm
        email={userEmail}
        onVerified={handleVerificationSuccess}
        expiresAt={expiryTime}
      />
    </div>
  );
}
