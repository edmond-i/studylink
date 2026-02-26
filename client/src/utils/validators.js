/**
 * Validation utilities for frontend
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 * @param {string} password - Password to validate
 */
export function isValidPassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}
