import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Lock, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import '../styles/StudyGroups.css';

function StudyGroupsHome() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGroups();
  }, [page, searchQuery]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/groups', {
        params: {
          page,
          limit: 12,
          search: searchQuery,
        },
      });
      setGroups(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch groups');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  if (loading && groups.length === 0) {
    return (
      <div className="study-groups-page">
        <div className="loading-spinner">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="study-groups-page">
      {/* Header */}
      <div className="sg-header">
        <div className="sg-title-section">
          <h1 className="sg-title">
            <Users size={32} />
            Study Groups
          </h1>
          <p className="sg-subtitle">Join a group or create your own study community</p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/groups/create')}
          className="create-group-btn"
        >
          <Plus size={20} />
          New Group
        </Button>
      </div>

      {/* Search & Filter */}
      <form className="sg-search-form" onSubmit={handleSearch}>
        <Input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          className="sg-search-input"
        />
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Groups Grid */}
      <div className="groups-grid">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Card
              key={group.id}
              className="group-card"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="group-card-header">
                <h3 className="group-name">{group.name}</h3>
                <span className="group-visibility">
                  {group.isPublic ? (
                    <Globe size={16} title="Public" />
                  ) : (
                    <Lock size={16} title="Private" />
                  )}
                </span>
              </div>

              <p className="group-description">{group.description || 'No description'}</p>

              <div className="group-meta">
                <span className="group-creator">
                  Created by {group.creator.name}
                </span>
                <span className="group-members">
                  <Users size={14} />
                  {group.memberCount} members
                </span>
              </div>

              <div className="group-channels">
                {group.channels.slice(0, 2).map((channel) => (
                  <span key={channel.id} className="channel-badge">
                    #{channel.name}
                  </span>
                ))}
                {group.channels.length > 2 && (
                  <span className="channel-more">
                    +{group.channels.length - 2} more
                  </span>
                )}
              </div>

              <div className="group-actions">
                {group.isMember ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/groups/${group.id}`);
                    }}
                  >
                    Open
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Add join functionality
                    }}
                  >
                    Join
                  </Button>
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="no-groups">
            <p>No groups found. Create one to get started!</p>
            <Button onClick={() => navigate('/groups/create')}>
              Create Group
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {groups.length > 0 && (
        <div className="sg-pagination">
          <Button
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="page-info">Page {page}</span>
          <Button
            variant="secondary"
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default StudyGroupsHome;
