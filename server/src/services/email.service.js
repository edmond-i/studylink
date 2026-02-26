import nodemailer from 'nodemailer';

/**
 * Initialize email transporter
 */
const emailConfigured = Boolean(
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
);

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

async function sendMailOrLog(mailOptions, debugCode = null) {
  if (!emailConfigured) {
    const codeSuffix = debugCode ? ` OTP=${debugCode}` : '';
    console.warn(
      `[email-disabled] To=${mailOptions.to} Subject="${mailOptions.subject}"${codeSuffix}`
    );
    return;
  }

  await transporter.sendMail(mailOptions);
}

/**
 * Send OTP verification email
 * @param {string} email - User email
 * @param {string} code - 6-digit OTP
 */
export async function sendOTPEmail(email, code) {
  try {
    await sendMailOrLog({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'StudyLink Email Verification',
      html: `
        <h2>Verify Your Email</h2>
        <p>Your verification code is:</p>
        <h1 style="font-family: monospace; letter-spacing: 2px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    }, code);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} name - User name
 */
export async function sendWelcomeEmail(email, name) {
  try {
    await sendMailOrLog({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to StudyLink!',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>We're excited to have you on StudyLink.</p>
        <p>Start learning, connect with peers, and unlock your potential.</p>
      `,
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send password reset email with OTP
 * @param {string} email - User email
 * @param {string} code - 6-digit OTP
 */
export async function sendPasswordResetEmail(email, code) {
  try {
    await sendMailOrLog({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'StudyLink Password Reset',
      html: `
        <h2>Reset Your Password</h2>
        <p>Your password reset code is:</p>
        <h1 style="font-family: monospace; letter-spacing: 2px;">${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    }, code);
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
}
