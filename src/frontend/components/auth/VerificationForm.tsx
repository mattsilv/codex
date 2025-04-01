import { h, JSX } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { API_URL } from '../../utils/api';
import useToast from '../../hooks/useToast';

interface VerificationFormProps {
  email: string;
  onVerified?: (data: any) => void;
  expiresAt?: string | null;
}

interface VerificationResponse {
  token: string;
  user: any;
  error?: string;
  expired?: boolean;
}

export default function VerificationForm({ 
  email, 
  onVerified, 
  expiresAt 
}: VerificationFormProps): JSX.Element {
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('0:00');
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  // Calculate time remaining for the verification code
  useEffect(() => {
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime();

      const updateTimer = (): void => {
        const now = new Date().getTime();
        const difference = expiryTime - now;

        if (difference > 0) {
          // Convert to minutes and seconds
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        } else {
          setTimeRemaining('Expired');
          clearInterval(timerId);
        }
      };

      // Initial update
      updateTimer();

      // Update every second
      const timerId = setInterval(updateTimer, 1000);

      return () => clearInterval(timerId);
    }
    return undefined; // Return undefined for the else path
  }, [expiresAt]);

  const handleSubmit = async (e: JSX.TargetedEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      const data: VerificationResponse = await response.json();

      if (!response.ok) {
        if (data.expired) {
          setError('Verification code has expired. Please request a new one.');
        } else {
          setError(data.error || 'Failed to verify email');
        }
        showError(data.error || 'Failed to verify email');
        return;
      }

      // Success - store the new token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));

      showSuccess('Email verified successfully!');

      if (onVerified) {
        onVerified(data);
      } else {
        // Redirect to dashboard if no callback provided
        route('/dashboard');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('An error occurred. Please try again.');
      showError('Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async (): Promise<void> => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend code');
        showError(data.error || 'Failed to resend verification code');
        return;
      }

      showSuccess('Verification code has been resent to your email');

      // Update expiry time if provided
      if (data.expiresAt) {
        // This will trigger the useEffect to recalculate the timer
        // Note: We can't modify props directly, so we'd need to handle this differently
        // in a real application (maybe through a callback or context update)
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('An error occurred. Please try again.');
      showError('Failed to resend verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verification-form max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Verify Your Email</h2>

      <div className="mb-6 text-center">
        <p>We&apos;ve sent a 6-digit verification code to:</p>
        <p className="font-bold text-lg my-2">{email}</p>
        <p className="text-sm text-gray-600">
          {timeRemaining === 'Expired'
            ? 'Your code has expired. Please request a new one.'
            : `Code expires in: ${timeRemaining}`}
        </p>
        <p>If you didn&apos;t request this, please ignore this email.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Verification Code"
          type="text"
          name="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode((e.target as HTMLInputElement).value)}
          placeholder="Enter 6-digit code"
          required
          className="text-center text-2xl tracking-wider"
        />

        <Button
          type="submit"
          disabled={isSubmitting || timeRemaining === 'Expired'}
          className="w-full"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </Button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isSubmitting}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Didn&apos;t receive a code? Resend
          </button>
        </div>
      </form>
    </div>
  );
}