import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, Settings, Zap, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../ui/NotificationCenter';
import { toggleTheme } from '../../theme';
import { useEffect } from 'react';
import { detectAndApplyTheme } from '../../theme';
import './Navbar.css';

/**
 * Main navigation bar (sticky top)
 */
function Navbar({ onMenuToggle, isMobileMenuOpen }) {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  useEffect(() => {
    const current = detectAndApplyTheme();
    setTheme(current);
  }, []);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Logo & Hamburger */}
        <div className="navbar-left">
          <button className="hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link className="logo-container" to="/" aria-label="Go to StudyLink home">
            <BookOpen size={28} />
            <span className="logo-text">StudyLink</span>
          </Link>
        </div>

        {/* User Menu */}
        <div className="navbar-right">
          <div className="xp-chip" title="Current XP">
            <Zap size={14} />
            <span>{user?.xp || 0}</span>
          </div>
          <NotificationCenter />
          <button className="theme-toggle" onClick={handleToggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="user-menu">
            <button
              className="user-button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-label="User menu"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="user-avatar" />
              ) : (
                <div className="avatar-placeholder">{user?.name?.charAt(0).toUpperCase()}</div>
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="profile-header">
                  <div className="profile-info">
                    <p className="profile-name">{user?.name}</p>
                    <p className="profile-email">{user?.email}</p>
                  </div>
                </div>

                <div className="profile-divider" />

                <button
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <Settings size={16} />
                  Profile Settings
                </button>

                <button className="profile-menu-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
