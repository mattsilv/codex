// Simple auth utility functions for the MVP

// Check if a user is logged in (local storage check for MVP)
export function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

// Get the current user from local storage
export function getCurrentUser() {
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
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate password strength (matches backend requirements)
export function validatePassword(password) {
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
