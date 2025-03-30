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

// Validate password strength for MVP
export function validatePassword(password) {
  // For MVP, just require 6+ characters
  return password && password.length >= 6;
}