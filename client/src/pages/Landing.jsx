import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Zap, Brain, Bell, TrendingUp, Star, CreditCard } from 'lucide-react';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import './Landing.css';

/**
 * Landing page for unauthenticated users
 */
function Landing() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const showToast = useToast();

  // update document title/metadata when viewing landing
  React.useEffect(() => {
    document.title = 'StudyLink — Learn Together';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Join StudyLink free: community forums, study groups, AI tutor, and a curated resource library.'
      );
    }

    const handler = (e) => {
      // prevent automatic prompt
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('App installed!', 'success');
        } else {
          showToast('Installation cancelled', 'info');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <div className="logo">
            <BookOpen size={32} />
            <span>StudyLink</span>
          </div>
          <div className="auth-buttons">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/signup')}>Join Now</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <h1>Learn Together, Grow Together</h1>
          <p className="hero-subtitle">Trusted by over <strong>10,000+</strong> students worldwide</p>
          <p>
            StudyLink combines community forums, study groups, real-time notifications,
            a leaderboard, a resource library, and an AI tutor that guides you without solving
            problems for you.
          </p>
          <Button size="lg" onClick={() => navigate('/signup')}>
            Start Learning Free
          </Button>
          {deferredPrompt && (
            <Button variant="outline" size="lg" onClick={handleInstall}>
              Install App
            </Button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <h2>Why StudyLink?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Users size={32} />
            <h3>Community Forums</h3>
            <p>Ask questions, share resources, and learn from peers in Reddit-style forums.</p>
          </div>
          <div className="feature-card">
            <Zap size={32} />
            <h3>Study Groups</h3>
            <p>Join private groups with real-time chat, channels, and admin controls.</p>
          </div>
          <div className="feature-card">
            <Brain size={32} />
            <h3>AI Socratic Tutor</h3>
            <p>Get guidance through questions, not answers. Learn to think, not to copy.</p>
          </div>
          <div className="feature-card">
            <BookOpen size={32} />
            <h3>Structured Progress</h3>
            <p>Track your participation and build consistent study habits over time.</p>
          </div>
          <div className="feature-card">
            <Bell size={32} />
            <h3>Notifications</h3>
            <p>Stay in the loop with alerts for replies, upvotes, group invites, and more.</p>
          </div>
          <div className="feature-card">
            <TrendingUp size={32} />
            <h3>Community Highlights</h3>
            <p>See active contributors and stay connected to what the community is learning.</p>
          </div>
          <div className="feature-card">
            <Star size={32} />
            <h3>Resource Library</h3>
            <p>Browse and bookmark curated study materials across every subject.</p>
          </div>
          <div className="feature-card">
            <CreditCard size={32} />
            <h3>Premium Plans</h3>
            <p>Unlock unlimited groups, priority support, analytics, and more.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2>Ready to join?</h2>
        <p>Sign up free and start learning with thousands of students.</p>
        <div className="cta-buttons">
          <Button size="lg" onClick={() => navigate('/signup')}>
            Create Your Account
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/pricing')}>
            View Pricing
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="landing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>Is StudyLink free?</h3>
            <p>The core platform is completely free for all users. Premium plans add advanced features such as unlimited
               study groups, analytics, and priority support.</p>
          </div>
          <div className="faq-item">
            <h3>How does the AI Tutor work?</h3>
            <p>The AI tutor uses a Socratic method to guide you with questions, helping you think through problems rather
               than providing direct answers.</p>
          </div>
          <div className="faq-item">
            <h3>Can I create my own study groups?</h3>
            <p>Absolutely! Any registered user can create and invite others to study groups. Premium users can create
               unlimited groups.</p>
          </div>
          <div className="faq-item">
            <h3>What happens after I cancel premium?</h3>
            <p>Your premium features remain active until the end of your current billing period, after which you'll revert
               to the free tier automatically.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials">
        <h2>Hear from our users</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>“StudyLink changed how I study. The AI tutor helped me think through problems instead of just giving me answers.”</p>
            <span className="author">– Maya, Physics major</span>
          </div>
          <div className="testimonial-card">
            <p>“I love the resource library and the community. I’ve saved hundreds of useful links and met study buddies.”</p>
            <span className="author">– Carlos, High school student</span>
          </div>
          <div className="testimonial-card">
            <p>“Upgrading to Pro was worth it for the unlimited groups and priority support. It made our team sessions much smoother.”</p>
            <span className="author">– Priya, Software engineer</span>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="landing-roadmap">
        <h2>Coming soon</h2>
        <ul>
          <li>Progressive Web App with offline access</li>
          <li>Mobile app launch (iOS & Android)</li>
          <li>Enhanced analytics & insights for premium users</li>
          <li>SSO/logins for schools and organizations</li>
          <li>Workspace personalization</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2026 StudyLink. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
