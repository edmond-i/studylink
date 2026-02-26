import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generate a random 8-character invite code
 */
export function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate random 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Format a string for display (truncate if needed)
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 */
export function truncate(str, maxLength = 50) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format date for display
 * @param {Date} date - Date to format
 */
export function formatDate(date) {
  if (!date) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

/**
 * Parse topic keywords from text and find matching resources
 * @param {string} text - Text to search
 * @param {Object} resourceMap - Resource map JSON
 */
export function detectTopicsAndFindResources(text, resourceMap) {
  if (!text || !resourceMap) return [];

  const lowerText = text.toLowerCase();
  const found = [];

  for (const [key, resource] of Object.entries(resourceMap)) {
    if (lowerText.includes(key.replace('-', ' ')) || lowerText.includes(key)) {
      found.push(resource);
    }
  }

  return found;
}

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
 * @param {string} password - Password to validate
 */
export function isValidPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}
