import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import '../styles/StudyGroups.css';

function ChannelChat({ channel, group }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [channel.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/channels/${channel.id}/messages`, {
        params: { page: 1, limit: 50 },
      });
      setMessages(response.data.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !group.isMember) return;

    const messageContent = newMessage;
    setNewMessage('');

    try {
      const response = await api.post(`/channels/${channel.id}/messages`, {
        content: messageContent,
      });

      setMessages([...messages, response.data]);
    } catch (err) {
      console.error('Error sending message:', err);
      setNewMessage(messageContent);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  if (loading) {
    return <div className="chat-container loading">Loading messages...</div>;
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h2>#{channel.name}</h2>
        <p className="channel-description">{channel.description}</p>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="message-group">
              <div className="message-author">
                <img src={msg.author.avatar || '/default-avatar.png'} alt={msg.author.name} />
                <div className="author-info">
                  <p className="author-name">{msg.author.name}</p>
                  <p className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="message-content-wrapper">
                <p className="message-content">{msg.content}</p>
                {msg.author.id === user?.id && (
                  <button
                    className="delete-msg-btn"
                    onClick={() => handleDeleteMessage(msg.id)}
                    title="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <p>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {group.isMember ? (
        <form className="message-input-form" onSubmit={handleSendMessage}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            rows={2}
            disabled={!group.isMember}
          />
          <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
            <Send size={18} />
          </button>
        </form>
      ) : (
        <div className="not-member-notice">
          Join the group to send messages
        </div>
      )}
    </div>
  );
}

export default ChannelChat;
