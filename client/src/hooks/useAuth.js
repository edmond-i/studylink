import { useEffect, useState, useCallback } from 'react';

const GUEST_USER = {
  id: 'guest-local',
  name: 'Guest',
  email: 'guest@studylink.local',
  isVerified: true,
  isPro: false,
  isGuest: true,
  xp: 0,
  streak: 0,
};

/**
 * Hook to manage user authentication state
 * Persists auth data in localStorage and handles token refresh
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('auth');
      if (stored) {
        const { user: userData } = JSON.parse(stored);
        setUser(userData);
      } else {
        setUser(GUEST_USER);
        localStorage.setItem(
          'auth',
          JSON.stringify({ user: GUEST_USER, token: null, timestamp: Date.now() }),
        );
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(GUEST_USER);
      localStorage.setItem(
        'auth',
        JSON.stringify({ user: GUEST_USER, token: null, timestamp: Date.now() }),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login user and persist to localStorage
   * @param {Object} user - User object
   * @param {string} token - JWT token
   */
  const login = useCallback((user, token) => {
    setUser(user);
    localStorage.setItem('auth', JSON.stringify({ user, token, timestamp: Date.now() }));
  }, []);

  /**
   * Logout user and clear localStorage
   */
  const logout = useCallback(() => {
    setUser(GUEST_USER);
    localStorage.setItem(
      'auth',
      JSON.stringify({ user: GUEST_USER, token: null, timestamp: Date.now() }),
    );
  }, []);

  /**
   * Update user profile data
   * @param {Partial<User>} updates - Fields to update
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      const stored = localStorage.getItem('auth');
      if (stored) {
        const { token } = JSON.parse(stored);
        localStorage.setItem('auth', JSON.stringify({ user: updated, token, timestamp: Date.now() }));
      }
      return updated;
    });
  }, []);

  return { user, isLoading, login, logout, updateUser };
}
