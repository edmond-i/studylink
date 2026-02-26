import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getPlans,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  getUserSubscription,
  cancelSubscription,
} from '../controllers/premium.controller.js';

const router = express.Router();

/**
 * GET /api/premium/plans
 * Get all available subscription plans
 */
router.get('/plans', getPlans);

/**
 * POST /api/premium/checkout
 * Create Stripe checkout session
 * @body priceId - Stripe price ID for the plan
 */
router.post('/checkout', verifyToken, createCheckoutSession);

/**
 * POST /api/premium/portal
 * Create Stripe customer portal session (manage subscription)
 */
router.post('/portal', verifyToken, createPortalSession);

/**
 * GET /api/premium/subscription
 * Get current user's subscription info
 */
router.get('/subscription', verifyToken, getUserSubscription);

/**
 * POST /api/premium/cancel
 * Cancel user's subscription
 */
router.post('/cancel', verifyToken, cancelSubscription);

/**
 * POST /api/premium/webhook
 * Handle Stripe webhooks (no auth needed - Stripe signature verification)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default router;
