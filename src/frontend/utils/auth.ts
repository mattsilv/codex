// Simple auth utility functions for the MVP

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

// Check if a user is logged in (local storage check for MVP)
export function isLoggedIn(): boolean {
  return localStorage.getItem('user') !== null;
}

// Get the current user from local storage
export function getCurrentUser(): User | null {
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

// Validate email format
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate password strength (matches backend requirements)
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
