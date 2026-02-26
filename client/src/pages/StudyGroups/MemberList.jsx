import React, { useState, useEffect } from 'react';
import { X, Trash2, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { api } from '../../services/api';
import '../styles/StudyGroups.css';

function MemberList({ groupId, isAdmin, onClose }) {
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  const fetchMembers = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/members`);
      setMembers(response.data.members);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      await api.post(`/groups/${groupId}/invite`, { email: inviteEmail });
      setInviteEmail('');
      // Refresh members list
      await fetchMembers();
    } catch (err) {
      console.error('Error inviting member:', err);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Remove this member from the group?')) return;

    try {
      await api.delete(`/groups/${groupId}/members/${memberId}`);
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  return (
    <div className="members-list-container">
      <div className="members-list-header">
        <h3>Members</h3>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {isAdmin && (
        <form className="invite-form" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Invite by email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            icon={<Mail size={16} />}
          />
          <Button type="submit" size="sm" disabled={inviting}>
            {inviting ? 'Inviting...' : 'Invite'}
          </Button>
        </form>
      )}

      <div className="members-scroll">
        {loading ? (
          <p className="loading">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="no-members">No members yet</p>
        ) : (
          members.map((member) => (
            <div key={member.id} className="member-item">
              <img src={member.avatar || '/default-avatar.png'} alt={member.name} />
              <div className="member-info">
                <p className="member-name">{member.name}</p>
                <p className="member-xp">Member</p>
              </div>
              {isAdmin && (
                <button
                  className="remove-member-btn"
                  onClick={() => handleRemoveMember(member.id)}
                  title="Remove member"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MemberList;
