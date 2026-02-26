import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { generateOTP, isValidEmail, isValidPassword } from '../utils/helpers.js';

const prisma = new PrismaClient();

function shouldExposeDevOtp() {
  const emailConfigured = Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
  return process.env.NODE_ENV !== 'production' && !emailConfigured;
}

/**
 * Sign up new user
 * POST /api/auth/signup
 */
export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Generate and send OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await prisma.verificationOTP.upsert({
      where: { userId: user.id },
      update: { code: otp, expiresAt: otpExpiry },
      create: { userId: user.id, code: otp, expiresAt: otpExpiry },
    });

    await sendOTPEmail(email, otp);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isPro: user.isPro },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isPro: user.isPro,
        xp: user.xp,
        streak: user.streak,
      },
      token,
      verificationCode: shouldExposeDevOtp() ? otp : undefined,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, isPro: user.isPro },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isPro: user.isPro,
        xp: user.xp,
        streak: user.streak,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Verify email with OTP
 * POST /api/auth/verify-email
 */
export async function verifyEmail(req, res) {
  try {
    const { code } = req.body;
    const userId = req.user?.id;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Code and user ID required' });
    }

    // Verify OTP
    const otp = await prisma.verificationOTP.findUnique({
      where: { userId },
    });

    if (!otp || otp.code !== code || new Date() > otp.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    // Delete OTP record
    await prisma.verificationOTP.delete({
      where: { userId },
    });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}

/**
 * Resend OTP to email
 * POST /api/auth/resend-otp
 */
export async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationOTP.upsert({
      where: { userId: user.id },
      update: { code: otp, expiresAt: otpExpiry },
      create: { userId: user.id, code: otp, expiresAt: otpExpiry },
    });

    await sendOTPEmail(email, otp);

    res.json({
      message: 'OTP sent successfully',
      verificationCode: shouldExposeDevOtp() ? otp : undefined,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
}

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationOTP.upsert({
      where: { userId: user.id },
      update: { code: otp, expiresAt: otpExpiry },
      create: { userId: user.id, code: otp, expiresAt: otpExpiry },
    });

    await sendPasswordResetEmail(email, otp);

    res.json({
      message: 'Password reset code sent to email',
      resetCode: shouldExposeDevOtp() ? otp : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
}

/**
 * Reset password with OTP
 * POST /api/auth/reset-password
 */
export async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password required' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP
    const otp = await prisma.verificationOTP.findUnique({
      where: { userId: user.id },
    });

    if (!otp || otp.code !== code || new Date() > otp.expiresAt) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete OTP
    await prisma.verificationOTP.delete({
      where: { userId: user.id },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
}
