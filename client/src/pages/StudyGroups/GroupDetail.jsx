import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, Settings, ArrowLeft, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ChannelChat from './ChannelChat';
import MemberList from './MemberList';
import { api } from '../../services/api';
import '../styles/StudyGroups.css';

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const [groupRes, channelsRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/channels`),
      ]);

      setGroup(groupRes.data);
      setChannels(channelsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch group');
      console.error('Error fetching group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    try {
      const response = await api.post(`/groups/${groupId}/channels`, {
        name: channelName,
      });

      setChannels([...channels, response.data]);
      setChannelName('');
      setShowCreateChannel(false);
    } catch (err) {
      console.error('Error creating channel:', err);
    }
  };

  if (loading) {
    return (
      <div className="group-detail-page">
        <div className="loading-spinner">Loading group...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="group-detail-page">
        <div className="error-message">{error || 'Group not found'}</div>
      </div>
    );
  }

  return (
    <div className="group-detail-page">
      {/* Group Header */}
      <div className="gd-header">
        <button className="back-btn" onClick={() => navigate('/groups')}>
          <ArrowLeft size={20} />
        </button>
        <div className="gd-header-info">
          <h1 className="gd-title">{group.name}</h1>
          <p className="gd-meta">
            {group.memberCount} members • {channels.length} channels
          </p>
        </div>
        {group.isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/groups/${groupId}/settings`)}
          >
            <Settings size={18} />
          </Button>
        )}
      </div>

      <div className="gd-container">
        {/* Channels Sidebar */}
        <aside className="channels-sidebar">
          <div className="channels-header">
            <h3>Channels</h3>
            {group.isMember && (
              <button
                className="add-channel-btn"
                onClick={() => setShowCreateChannel(!showCreateChannel)}
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {showCreateChannel && (
            <form className="create-channel-form" onSubmit={handleCreateChannel}>
              <input
                type="text"
                placeholder="Channel name"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="channel-input"
                autoFocus
              />
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Create</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowCreateChannel(false);
                    setChannelName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="channels-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                className={`channel-item ${activeChannel?.id === channel.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel)}
              >
                <MessageSquare size={16} />
                {channel.name}
              </button>
            ))}
          </div>

          {/* Members Button */}
          <button
            className="members-btn"
            onClick={() => setShowMembers(!showMembers)}
          >
            <Users size={16} />
            Members ({group.memberCount})
          </button>
        </aside>

        {/* Main Chat Area */}
        <div className="gd-content">
          {activeChannel ? (
            <ChannelChat
              channel={activeChannel}
              group={group}
              onRefresh={fetchGroupData}
            />
          ) : (
            <div className="no-channel">
              <MessageSquare size={48} />
              <p>No channels yet. Create one to start chatting!</p>
            </div>
          )}
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <aside className="members-sidebar">
            <MemberList
              groupId={groupId}
              isAdmin={group.isAdmin}
              onClose={() => setShowMembers(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default GroupDetail;
