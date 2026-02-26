import { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  TrendingUp,
  Star,
  Home,
  CreditCard,
} from 'lucide-react';
import './Sidebar.css';

/**
 * Left sidebar navigation
 */
function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = useMemo(
    () => [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/forum', label: 'Forums', icon: MessageCircle },
      { path: '/groups', label: 'Study Groups', icon: Users },
      { path: '/ai-tutor', label: 'AI Tutor', icon: BookOpen },
      { path: '/leaderboard', label: 'Leaderboard', icon: TrendingUp },
      { path: '/library', label: 'Resource Library', icon: Star },
    ],
    [],
  );

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map(({ path, label, icon: Icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`nav-link ${isActive(path) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={20} />
                  <span className="nav-label">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer - Premium CTA */}
        <div className="sidebar-footer">
          <div className="premium-card">
            <Star size={24} />
            <h3>StudyLink Pro</h3>
            <p>Unlimited AI messages, study groups & more</p>
            <Link to="/pricing" className="premium-btn" onClick={onClose}>
              Upgrade Now
            </Link>
          </div>

          {/* Billing Link */}
          <Link to="/billing" className="sidebar-footer-link" onClick={onClose}>
            <CreditCard size={16} />
            <span>Billing</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
