import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useToast } from '../components/ui/Toast';
import './styles/Billing.css';

function Billing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    fetchSubscription();

    // Show success message if just completed checkout
    if (searchParams.get('session_id')) {
      showToast('Subscription activated. Welcome to premium.', 'success');
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.get('/premium/subscription');
      setSubscription(response.data);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      showToast('Failed to load subscription details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await api.post('/premium/portal');
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Error opening portal:', err);
      showToast('Failed to open billing portal', 'error');
    }
  };

  const handleCancelSubscription = async () => {
    if (!isConfirmingCancel) {
      setIsConfirmingCancel(true);
      return;
    }

    try {
      await api.post('/premium/cancel');
      showToast('Subscription cancelled. Your plan will end at the next billing cycle.', 'info');
      setIsConfirmingCancel(false);
      fetchSubscription();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      showToast('Failed to cancel subscription', 'error');
    }
  };

  if (loading) {
    return <div className="billing-loading">Loading billing information...</div>;
  }

  const isPremium = subscription?.isPremium;
  const tier = subscription?.tier;

  return (
    <div className="billing-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="billing-header">
        <h1>Billing & Subscription</h1>
        <p>Manage your subscription and billing information</p>
      </div>

      <div className="billing-container">
        {/* Current Plan Card */}
        <Card className={`plan-card ${isPremium ? 'premium' : 'free'}`}>
          <div className="plan-header">
            <div className="plan-icon">
              {isPremium ? <CheckCircle size={34} /> : <CreditCard size={34} />}
            </div>
            <div className="plan-details">
              <h2 className="current-plan">
                {isPremium ? tier?.toUpperCase() : 'FREE'} Plan
              </h2>
              <p className="plan-status">
                {isPremium ? 'Active Premium Subscription' : 'Upgrade to Premium'}
              </p>
            </div>
          </div>

          {isPremium && (
            <div className="billing-info">
              <div className="info-row">
                <span className="info-label">
                  <Calendar size={16} />
                  Renewal Date
                </span>
                <span className="info-value">
                  {new Date(subscription.endsAt).toLocaleDateString()}
                </span>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="cancellation-notice">
                  <AlertCircle size={16} />
                  <div>
                    <p className="notice-title">Cancellation Scheduled</p>
                    <p className="notice-text">
                      Your subscription will end on{' '}
                      {new Date(subscription.endsAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="plan-actions">
                <Button onClick={handleManageBilling} variant="primary">
                  <CreditCard size={16} />
                  Manage Payment Method
                </Button>

                <Button
                  onClick={handleCancelSubscription}
                  variant="secondary"
                  className={isConfirmingCancel ? 'confirm-cancel' : ''}
                >
                  {isConfirmingCancel
                    ? 'Click again to confirm cancellation'
                    : 'Cancel Subscription'}
                </Button>
              </div>
            </div>
          )}

          {!isPremium && (
            <div className="upgrade-section">
              <p>Unlock premium features and support your learning journey</p>
              <Button onClick={() => navigate('/pricing')} size="lg">
                View Pricing Plans
              </Button>
            </div>
          )}
        </Card>

        {/* Premium Features Summary */}
        {isPremium && (
          <Card className="features-summary">
            <h3>Your Premium Benefits</h3>
            <div className="benefits-grid">
              <div className="benefit">
                <CheckCircle size={20} />
                <div>
                  <h4>Unlimited Content</h4>
                  <p>Create unlimited forum posts and join/create study groups</p>
                </div>
              </div>
              <div className="benefit">
                <CheckCircle size={20} />
                <div>
                  <h4>Enhanced AI Tutor</h4>
                  <p>Unlimited AI tutor messages and advanced learning features</p>
                </div>
              </div>
              <div className="benefit">
                <CheckCircle size={20} />
                <div>
                  <h4>Priority Support</h4>
                  <p>Get help faster with our dedicated support team</p>
                </div>
              </div>
              <div className="benefit">
                <CheckCircle size={20} />
                <div>
                  <h4>Advanced Analytics</h4>
                  <p>Track your learning progress with detailed analytics</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Billing History */}
        <Card className="billing-history">
          <h3>Billing History</h3>
          <p className="history-note">Your invoices will appear here. Manage receipts in the billing portal.</p>
          <Button onClick={handleManageBilling} variant="secondary">
            <CreditCard size={16} />
            Open Billing Portal
          </Button>
        </Card>

        {/* Invoice & Receipts */}
        <Card className="invoice-section">
          <h3>Invoices & Receipts</h3>
          <p className="invoice-note">
            All your invoices, receipts, and billing documents are available in your Stripe billing portal.
            You can download them anytime for your records.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default Billing;
