import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import './styles/Pricing.css';

function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/premium/plans');
      setPlans(response.data.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
      showToast('Failed to load pricing plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/premium/subscription');
      setCurrentSubscription(response.data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const handleUpgrade = async (priceId, planName) => {
    try {
      setCheckingOut(planName);

      // Create checkout session
      const response = await api.post('/premium/checkout', { priceId });
      const { sessionId } = response.data;

      // Load Stripe
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        showToast('Stripe is not configured. Set VITE_STRIPE_PUBLISHABLE_KEY.', 'error');
        return;
      }
      const stripe = await loadStripe(publishableKey);
      if (!stripe) {
        showToast('Unable to initialize Stripe checkout.', 'error');
        return;
      }

      // Redirect to checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        showToast(error.message, 'error');
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      showToast('Failed to start checkout', 'error');
    } finally {
      setCheckingOut(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/premium/portal');
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error opening portal:', err);
      showToast('Failed to open billing portal', 'error');
    }
  };

  if (loading) {
    return <div className="pricing-loading">Loading pricing plans...</div>;
  }

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <div className="pricing-hero">
        <h1 className="pricing-title">Simple, Transparent Pricing</h1>
        <p className="pricing-subtitle">
          Choose the perfect plan for your learning journey
        </p>
      </div>

      <div className="pricing-container">
        {/* Free Plan */}
        <Card className="pricing-card free-plan">
          <div className="plan-header">
            <h3 className="plan-name">Free</h3>
            <p className="plan-price">$0<span>/mo</span></p>
          </div>
          <p className="plan-description">Perfect for getting started</p>

          <ul className="features-list">
            <li>
              <Check size={16} />
              <span>Create & join study groups</span>
            </li>
            <li>
              <Check size={16} />
              <span>Post in forums (limited)</span>
            </li>
            <li>
              <Check size={16} />
              <span>10 AI tutor messages/month</span>
            </li>
            <li>
              <Check size={16} />
              <span>Basic leaderboard</span>
            </li>
            <li className="unavailable">
              <Check size={16} />
              <span>Priority support</span>
            </li>
          </ul>

          <Button disabled className="plan-button">
            Current Plan
          </Button>
        </Card>

        {/* Paid Plans */}
        {plans.map((plan) => {
          const isCurrentPlan =
            currentSubscription?.tier === plan.id && currentSubscription?.isPremium;

          return (
            <Card
              key={plan.id}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}

              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-price">
                  ${(plan.price / 100).toFixed(2)}<span>/mo</span>
                </p>
              </div>
              <p className="plan-description">
                {plan.id === 'starter'
                  ? 'Perfect for individual learners'
                  : plan.id === 'pro'
                  ? 'Most popular for active learners'
                  : 'For teams & organizations'}
              </p>

              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                disabled={isCurrentPlan || checkingOut === plan.name}
                onClick={() => handleUpgrade(plan.priceId, plan.name)}
                className={isCurrentPlan ? 'current-plan' : 'plan-button'}
              >
                {isCurrentPlan ? (
                  <>Current Plan</>
                ) : checkingOut === plan.name ? (
                  <>Processing...</>
                ) : (
                  <>
                    Upgrade <ArrowRight size={14} />
                  </>
                )}
              </Button>

              {isCurrentPlan && currentSubscription?.endsAt && (
                <p className="plan-ends-at">
                  Renews on{' '}
                  {new Date(currentSubscription.endsAt).toLocaleDateString()}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription?.isPremium && (
        <Card className="subscription-info">
          <div className="info-content">
            <Zap size={24} className="info-icon" />
            <div className="info-text">
              <h3>Active Subscription</h3>
              <p>You're on the {currentSubscription.tier.toUpperCase()} plan</p>
              {currentSubscription.cancelAtPeriodEnd && (
                <p className="cancellation-warning">
                  Your subscription will be cancelled on{' '}
                  {new Date(currentSubscription.endsAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button variant="secondary" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        </Card>
      )}

      {/* FAQ Section */}
      <div className="pricing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Can I change plans?</h4>
            <p>Yes! You can upgrade or downgrade your plan anytime. Changes take effect at the next billing cycle.</p>
          </div>
          <div className="faq-item">
            <h4>Is there a free trial?</h4>
            <p>We offer a free plan to get started. No credit card required!</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>We offer a 7-day money-back guarantee. Contact support if you're not satisfied.</p>
          </div>
          <div className="faq-item">
            <h4>What payment methods are accepted?</h4>
            <p>We accept all major credit and debit cards through Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
