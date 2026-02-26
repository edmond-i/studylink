import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../services/api';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import './Auth.css';

/**
 * Signup page
 */
function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validate
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!isValidEmail(formData.email)) newErrors.email = 'Valid email is required';
    if (!isValidPassword(formData.password))
      newErrors.password = 'Password must be 8+ chars with uppercase, lowercase, and number';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      const { user, token, verificationCode } = response.data;
      localStorage.setItem('auth', JSON.stringify({ user, token }));

      navigate('/verify-email', {
        state: {
          email: formData.email,
          verificationCode,
        },
      });
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <BookOpen size={32} />
          <h1>StudyLink</h1>
        </div>

        <form onSubmit={handleSignup}>
          <h2>Create Account</h2>

          {errors.submit && <div className="auth-error">{errors.submit}</div>}

          <Input
            type="text"
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
          />

          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
          />

          <Input
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={loading}
          />

          <Button type="submit" loading={loading} size="lg" style={{ width: '100%' }}>
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
