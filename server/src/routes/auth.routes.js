import express from 'express';
import { signup, login, verifyEmail, resendOTP, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', login);

/**
 * POST /api/auth/verify-email
 * Verify email with OTP
 */
router.post('/verify-email', verifyToken, verifyEmail);

/**
 * POST /api/auth/resend-otp
 * Resend verification OTP
 */
router.post('/resend-otp', resendOTP);

/**
 * POST /api/auth/forgot-password
 * Request password reset OTP
 */
router.post('/forgot-password', forgotPassword);

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', resetPassword);

export default router;
