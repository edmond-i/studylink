import React, { useState, useEffect, useRef } from 'react';
import {
  AtSign,
  Bell,
  BellDot,
  Check,
  CheckCheck,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  Trash2,
  Trophy,
  UserPlus,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { api } from '../../services/api';
import './NotificationCenter.css';

function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: { limit: 10, offset: 0 },
      });
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/unread/count');
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'post_upvote':
        return <ThumbsUp size={16} />;
      case 'comment_reply':
        return <MessageCircle size={16} />;
      case 'group_invitation':
        return <UserPlus size={16} />;
      case 'group_message':
        return <MessageSquare size={16} />;
      case 'badge_earned':
        return <Trophy size={16} />;
      case 'mention':
        return <AtSign size={16} />;
      default:
        return <BellDot size={16} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'post_upvote':
      case 'comment_upvote':
        return 'upvote';
      case 'comment_reply':
      case 'group_message':
        return 'message';
      case 'group_invitation':
        return 'group';
      case 'badge_earned':
        return 'badge';
      default:
        return 'default';
    }
  };

  return (
    <div className="notification-center" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck size={14} />
                Mark all
              </Button>
            )}
          </div>

          {loading ? (
            <div className="notification-loading">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet</div>
          ) : (
            <div className="notification-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? 'read' : 'unread'} ${getNotificationColor(
                    notif.type
                  )}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="notification-content">
                    <a href={notif.actionUrl} className="notification-link">
                      <h4 className="notification-title">{notif.title}</h4>
                      <p className="notification-message">{notif.message}</p>
                    </a>
                    <p className="notification-time">
                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="notification-actions">
                    {!notif.isRead && (
                      <button
                        className="action-btn"
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteNotification(notif.id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="notification-footer">
            <a href="/notifications" className="view-all-link">
              View All Notifications →
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}

export default NotificationCenter;
