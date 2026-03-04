import React, { useState, useEffect } from 'react';
import { Activity, FileText, Medal, MessageSquare, Sparkles, Trophy, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { api } from '../services/api';
import './styles/Leaderboard.css';

const AVATAR_EMOJIS = ['🦊', '🐼', '🦉', '🐧', '🐯', '🦁', '🐨', '🐝', '🐬', '🦖', '🦄', '🐢'];

function hashSeed(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
}

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarLoadErrors, setAvatarLoadErrors] = useState({});

  useEffect(() => {
    fetchLeaderboard();
    fetchStats();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaderboard', {
        params: { timeframe, limit: 50 },
      });
      setLeaderboard(response.data.leaderboard);
      setAvatarLoadErrors({});
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/leaderboard/stats');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return 'rank-normal';
  };

  const handleAvatarError = (userId) => {
    setAvatarLoadErrors((current) => {
      if (current[userId]) return current;
      return { ...current, [userId]: true };
    });
  };

  const getFallbackAvatar = (user) => {
    const seed = `${user?.id ?? ''}-${user?.name ?? ''}-${user?.email ?? ''}`;
    const hash = hashSeed(seed);
    const initials = getInitials(user?.name ?? '');

    if (initials && hash % 2 === 1) return initials;
    return AVATAR_EMOJIS[hash % AVATAR_EMOJIS.length];
  };

  if (error) {
    return <div className="leaderboard-error">{error}</div>;
  }

  return (
    <div className="leaderboard">
      {/* Hero Section */}
      <div className="lb-hero">
        <div className="lb-hero-content">
          <Trophy size={48} className="lb-hero-icon" />
          <h1 className="lb-hero-title">StudyLink Leaderboard</h1>
          <p className="lb-hero-subtitle">
            Track top contributors across the community
          </p>
        </div>
      </div>

      <div className="lb-container">
        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <Card className="stat-card">
              <div className="stat-icon">
                <Users size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Users</p>
                <p className="stat-value">{stats.totalUsers}</p>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">
                <Activity size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Contribution Score</p>
                <p className="stat-value">{stats.totalXP.toLocaleString()}</p>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">
                <FileText size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Forum Posts</p>
                <p className="stat-value">{stats.totalPosts}</p>
              </div>
            </Card>
            <Card className="stat-card">
              <div className="stat-icon">
                <MessageSquare size={20} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Messages Sent</p>
                <p className="stat-value">{stats.totalMessages}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Timeframe Tabs */}
        <div className="timeframe-tabs">
          {['all', 'monthly', 'weekly'].map((tf) => (
            <button
              key={tf}
              className={`tab-btn ${timeframe === tf ? 'active' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf === 'all' ? 'All Time' : tf === 'monthly' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <Card className="lb-table-card">
          {loading ? (
            <div className="lb-loading">Loading leaderboard...</div>
          ) : leaderboard.length === 0 ? (
            <div className="lb-empty">No ranking data yet</div>
          ) : (
            <div className="lb-table-wrapper">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th className="rank-col">Rank</th>
                    <th className="name-col">User</th>
                    <th className="score-col">Score</th>
                    <th className="badges-col">Badges</th>
                    <th className="rank-badge-col">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr key={entry.user.id} className={`lb-row ${getRankColor(entry.rank)}`}>
                      <td className="rank-col">
                        <span className="rank-medal">
                          {entry.rank <= 3 && <Medal size={14} />}
                          <span>#{entry.rank}</span>
                        </span>
                      </td>
                      <td className="name-col">
                        <div className="user-info">
                          {entry.user.avatar && !avatarLoadErrors[entry.user.id] ? (
                            <img
                              src={entry.user.avatar}
                              alt={entry.user.name}
                              className="user-avatar"
                              onError={() => handleAvatarError(entry.user.id)}
                            />
                          ) : (
                            <div
                              className="user-avatar user-avatar-fallback"
                              role="img"
                              aria-label={`${entry.user.name} avatar fallback`}
                            >
                              {getFallbackAvatar(entry.user)}
                            </div>
                          )}
                          <span className="user-name">{entry.user.name}</span>
                        </div>
                      </td>
                      <td className="score-col">
                        <div className="score-display">
                          <span>{entry.xp.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="badges-col">
                        <span className="badge-count">
                          <Sparkles size={14} />
                          {entry.badgesCount}
                        </span>
                      </td>
                      <td className="rank-badge-col">
                        {entry.user.rank ? (
                          <span className="rank-label">{entry.user.rank}</span>
                        ) : (
                          <span className="rank-label-unset">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Section */}
        <Card className="lb-info-card">
          <h3 className="info-title">How Rankings Work</h3>
          <div className="ranking-notes">
            <p>Rankings are based on consistent activity in forums, study groups, and learning sessions.</p>
            <p>Quality contributions and community participation improve your position over time.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Leaderboard;
