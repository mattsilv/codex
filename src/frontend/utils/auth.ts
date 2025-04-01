/**
 * @deprecated This file is deprecated and should not be used for new code.
 * Use AuthContext and its hooks instead for authentication functionality.
 * 
 * The localStorage-based authentication approach has been replaced with
 * secure cookie-based authentication using Lucia Auth.
 * 
 * For user authentication status, use the useAuth() hook:
 * import useAuth from '../hooks/useAuth';
 * const { user, isAuthenticated } = useAuth();
 */

// Types we're keeping for compatibility
export interface User {
  id: string;
  email: string;
  username: string;
  [key: string]: unknown;
}

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * @deprecated Use AuthContext.isAuthenticated instead
 */
export function isLoggedIn(): boolean {
  console.warn('DEPRECATED: isLoggedIn() is deprecated. Use useAuth() hook instead.');
  // Compatibility: check if there's a stored user, but the real auth state is in cookies
  return localStorage.getItem('user') !== null;
}

/**
 * @deprecated Use AuthContext.user instead
 */
export function getCurrentUser(): User | null {
  console.warn('DEPRECATED: getCurrentUser() is deprecated. Use useAuth() hook instead.');
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Error parsing user JSON:', e);
      return null;
    }
  }
  return null;
}

// These validation functions are still useful
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for multiple character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const complexityScore = [
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  if (complexityScore < 3) {
    return {
      valid: false,
      message:
        'Password must contain at least 3 of: lowercase letters, uppercase letters, numbers, and special characters',
    };
  }

  return { valid: true };
}
