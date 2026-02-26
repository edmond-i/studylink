import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Trophy, Award } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './styles/UserProfile.css';

function UserProfile({ userId: propUserId }) {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const userId = routeUserId || propUserId || currentUser?.id;
  const [userProfile, setUserProfile] = useState(null);
  const [userBadges, setUserBadges] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isOwnProfile = Boolean(currentUser?.id && userId && currentUser.id === userId);

  useEffect(() => {
    if (!userId) return;
    fetchUserProfile();
    fetchUserBadges();
    fetchUserRank();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      // This would typically fetch from /api/users/:userId endpoint
      // For now, we'll load user data from the badges endpoint
      setLoading(true);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    try {
      const response = await api.get(`/leaderboard/user/${userId}/badges`);
      setUserBadges(response.data.badges);
    } catch (err) {
      console.error('Error fetching badges:', err);
    }
  };

  const fetchUserRank = async () => {
    try {
      const response = await api.get(`/leaderboard/user/${userId}/rank`);
      setUserRank(response.data);
    } catch (err) {
      console.error('Error fetching rank:', err);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const badgeRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'common';
      case 'rare':
        return 'rare';
      case 'epic':
        return 'epic';
      case 'legendary':
        return 'legendary';
      default:
        return 'common';
    }
  };

  return (
    <div className="user-profile">
      {/* Back Button */}
      <button className="back-to-leaderboard" onClick={() => navigate('/leaderboard')}>
        <ArrowLeft size={20} />
        Back to Leaderboard
      </button>

      {/* Profile Header */}
      {userRank && (
        <Card className="profile-header-card">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <img
                src={userRank.user.avatar}
                alt={userRank.user.name}
                className="profile-avatar"
              />
              <div className="profile-rank-badge">#{userRank.rank}</div>
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{userRank.user.name}</h1>
              <p className="profile-rank-title">{userRank.user.rank || 'Novice'}</p>
              <div className="profile-meta">
                <span className="meta-item">
                  <Award size={16} />
                  {userRank.totalContributions} Contributions
                </span>
                <span className="meta-item">
                  <Trophy size={16} />
                  {userBadges.length} Badges
                </span>
                <span className="meta-item">
                  <Trophy size={16} />
                  Rank {userRank.rank}
                </span>
              </div>
            </div>

            {isOwnProfile && (
              <Button
                variant="secondary"
                onClick={() => navigate('/settings')}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="profile-container">
        {/* Stats Section */}
        {userRank && (
          <div className="stats-section">
            <h2 className="section-title">Statistics</h2>
            <div className="stats-grid">
              <Card className="stat-card">
                <div className="stat-number">{userRank.totalContributions}</div>
                <div className="stat-name">Total Contributions</div>
              </Card>
              <Card className="stat-card">
                <div className="stat-number">#{userRank.rank}</div>
                <div className="stat-name">Rank</div>
              </Card>
              <Card className="stat-card">
                <div className="stat-number">{userBadges.length}</div>
                <div className="stat-name">Badges Earned</div>
              </Card>
              <Card className="stat-card">
                <div className="stat-number">{userRank.totalContributions}</div>
                <div className="stat-name">Contributions</div>
              </Card>
            </div>
          </div>
        )}

        {/* Badges Section */}
        <div className="badges-section">
          <h2 className="section-title">Achievements & Badges</h2>
          {userBadges.length === 0 ? (
            <Card className="no-badges">
              <p>No badges earned yet. Keep contributing to unlock badges!</p>
            </Card>
          ) : (
            <div className="badges-grid">
              {userBadges.map((badge) => (
                <Card
                  key={badge.id}
                  className={`badge-card ${badgeRarityColor(badge.rarity)}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <h3 className="badge-name">{badge.name}</h3>
                  <p className="badge-description">{badge.description}</p>
                  <p className="badge-earned-at">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Progress */}
        <div className="achievements-section">
          <h2 className="section-title">Locked Achievements</h2>
          <div className="locked-achievements">
            <Card className="locked-badge">
              <div className="locked-icon">
                <Lock size={28} />
              </div>
              <h3>Chat Master</h3>
              <p>Send 50+ messages in study groups</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <p className="progress-text">45/50 messages</p>
            </Card>

            <Card className="locked-badge">
              <div className="locked-icon">
                <Lock size={28} />
              </div>
              <h3>Knowledge Seeker</h3>
              <p>Start 10+ AI tutor conversations</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '30%' }}></div>
              </div>
              <p className="progress-text">3/10 chats</p>
            </Card>

            <Card className="locked-badge">
              <div className="locked-icon">
                <Lock size={28} />
              </div>
              <h3>Forum Expert</h3>
              <p>Reach 500+ forum contributions</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <p className="progress-text">300/500 contributions</p>
            </Card>

            <Card className="locked-badge">
              <div className="locked-icon">
                <Lock size={28} />
              </div>
              <h3>Rising Star</h3>
              <p>Reach 1000+ total contributions</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '85%' }}></div>
              </div>
              <p className="progress-text">{userRank?.totalContributions || 0}/1000 contributions</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
