import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import './Auth.css';

/**
 * Email verification page (OTP)
 */
function VerifyEmail() {
  const location = useLocation();
  const initialCode = location.state?.verificationCode || '';
  const initialEmail = location.state?.email || '';
  const storedEmail = (() => {
    try {
      const auth = JSON.parse(localStorage.getItem('auth') || '{}');
      return auth?.user?.email || '';
    } catch {
      return '';
    }
  })();

  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(initialCode ? `Local dev code: ${initialCode}` : '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const email = initialEmail || storedEmail;

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/verify-email', { code });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setMessage('');

    if (!email) {
      setError('Email not found. Please go back and sign up/login again.');
      return;
    }

    setResending(true);
    try {
      const response = await api.post('/auth/resend-otp', { email });
      const devCode = response?.data?.verificationCode;
      if (devCode) {
        setCode(devCode);
        setMessage(`New local dev code: ${devCode}`);
      } else {
        setMessage('A new verification code has been sent.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <BookOpen size={32} />
          <h1>StudyLink</h1>
        </div>

        <form onSubmit={handleVerify}>
          <h2>Verify Your Email</h2>
          <p className="auth-subtitle">Check your inbox for a 6-digit code sent to {email}</p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}

          <Input
            type="text"
            label="Verification Code"
            placeholder="000000"
            maxLength="6"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            required
            disabled={loading}
          />

          <Button type="submit" loading={loading} size="lg" style={{ width: '100%' }}>
            Verify
          </Button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="resend-link"
            disabled={loading || resending}
            onClick={handleResend}
          >
            Didn't receive a code? Resend
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
