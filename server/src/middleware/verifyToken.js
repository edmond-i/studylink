import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const GUEST_EMAIL = 'guest@studylink.local';

async function getOrCreateGuestUser() {
  let user = await prisma.user.findUnique({
    where: { email: GUEST_EMAIL },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Guest User',
        email: GUEST_EMAIL,
        passwordHash: 'guest_access_only',
        isVerified: true,
      },
    });
  }

  return user;
}

/**
 * Verify JWT access token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export async function verifyToken(req, res, next) {
  const authBypassEnabled = process.env.AUTH_BYPASS === 'true';
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    if (authBypassEnabled) {
      try {
        const guest = await getOrCreateGuestUser();
        req.user = {
          id: guest.id,
          email: guest.email,
          isPro: false,
          isGuest: true,
        };
        return next();
      } catch (error) {
        return res.status(500).json({ error: 'Guest access failed' });
      }
    }

    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    if (authBypassEnabled) {
      try {
        const guest = await getOrCreateGuestUser();
        req.user = {
          id: guest.id,
          email: guest.email,
          isPro: false,
          isGuest: true,
        };
        return next();
      } catch (guestError) {
        return res.status(500).json({ error: 'Guest access failed' });
      }
    }

    return res.status(403).json({ error: 'Invalid token' });
  }
}

/**
 * Require user to be premium
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export function requirePremium(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!req.user.isPro) {
    return res.status(403).json({ error: 'Premium required' });
  }
  next();
}
