import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function ensureStripeConfigured(res) {
  if (!stripe) {
    res.status(503).json({
      error: 'Stripe is not configured. Set STRIPE_SECRET_KEY in your environment.',
    });
    return false;
  }
  return true;
}

// Premium plan definitions
export const PREMIUM_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 999, // $9.99/month in cents
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      'Unlimited forum posts & comments',
      'Create up to 3 study groups',
      '50 AI tutor messages/month',
      'Advanced search & filters',
      'Discussion badges',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 2499, // $24.99/month
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Everything in Starter',
      'Unlimited study groups',
      'Unlimited AI tutor messages',
      'Priority support',
      'Advanced analytics',
      'Custom group roles',
      'File uploads (100MB)',
      'Group scheduling',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9999, // $99.99/month
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SSO (Single Sign-On)',
      'White-label options',
      'API access',
      'Advanced security',
      'SLA guarantee',
    ],
  },
};

/**
 * GET /api/premium/plans
 * Get all available subscription plans
 */
export async function getPlans(req, res) {
  try {
    const plans = Object.values(PREMIUM_PLANS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price, // Keep in cents for client formatting consistency
      priceId: plan.priceId,
      features: plan.features,
      popular: plan.id === 'pro',
    }));

    res.json({ plans });
  } catch (err) {
    console.error('Error fetching plans:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
}

/**
 * POST /api/premium/checkout
 * Create Stripe checkout session
 */
export async function createCheckoutSession(req, res) {
  try {
    if (!ensureStripeConfigured(res)) return;

    const { priceId } = req.body;
    const user = req.user;

    // Find or create Stripe customer
    let customer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    let stripeCustomerId = customer?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = stripeCustomer.id;

      // Save Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      allow_promotion_codes: true,
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

/**
 * POST /api/premium/portal
 * Create customer portal session
 */
export async function createPortalSession(req, res) {
  try {
    if (!ensureStripeConfigured(res)) return;

    const user = req.user;

    const stripeCustomer = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomer?.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/billing`,
    });

    res.json({ url: portalSession.url });
  } catch (err) {
    console.error('Error creating portal session:', err);
    res.status(500).json({ error: 'Failed to access billing portal' });
  }
}

/**
 * GET /api/premium/subscription
 * Get user's subscription info
 */
export async function getUserSubscription(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        isPremium: true,
        premiumTier: true,
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isPremium) {
      return res.json({
        isPremium: false,
        tier: 'free',
        status: 'inactive',
      });
    }

    // Get subscription details from Stripe if it exists
    let subscription = null;
    if (stripe && user.stripeSubscriptionId) {
      subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    }

    res.json({
      isPremium: user.isPremium,
      tier: user.premiumTier,
      status: user.subscriptionStatus,
      endsAt: user.subscriptionEndsAt,
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

/**
 * POST /api/premium/cancel
 * Cancel subscription
 */
export async function cancelSubscription(req, res) {
  try {
    if (!ensureStripeConfigured(res)) return;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { stripeSubscriptionId: true },
    });

    if (!user?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    // Cancel at end of billing period
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      message: 'Subscription will be cancelled at end of billing period',
      cancelAt: new Date(subscription.cancel_at * 1000),
    });
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

/**
 * POST /api/premium/webhook
 * Handle Stripe webhooks
 */
export async function handleWebhook(req, res) {
  if (!ensureStripeConfigured(res)) return;

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);

        // Update user subscription in database
        await prisma.user.update({
          where: { id: customer.metadata.userId },
          data: {
            stripeSubscriptionId: subscription.id,
            isPremium: subscription.status === 'active',
            isPro: subscription.status === 'active',
            subscriptionStatus: subscription.status,
            premiumTier: getPlanTierFromPriceId(subscription.items.data[0].price.id),
            subscriptionEndsAt: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await stripe.customers.retrieve(subscription.customer);

        // Mark subscription as cancelled
        await prisma.user.update({
          where: { id: customer.metadata.userId },
          data: {
            isPremium: false,
            isPro: false,
            subscriptionStatus: 'cancelled',
            subscriptionEndsAt: new Date(),
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const customer = await stripe.customers.retrieve(invoice.customer);
          // Could log successful payment here
          console.log(`Payment successful for user ${customer.metadata.userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          const customer = await stripe.customers.retrieve(invoice.customer);
          // Could send notification about failed payment
          console.log(`Payment failed for user ${customer.metadata.userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

/**
 * Helper: Get plan tier from Stripe price ID
 */
function getPlanTierFromPriceId(priceId) {
  for (const [key, plan] of Object.entries(PREMIUM_PLANS)) {
    if (plan.priceId === priceId) {
      return plan.id;
    }
  }
  return 'free';
}

/**
 * Helper: Check if user is premium
 */
export async function isPremiumUser(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    });
    return user?.isPremium || false;
  } catch (err) {
    return false;
  }
}
