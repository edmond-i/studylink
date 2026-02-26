import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, BookOpen, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ResourcePanel from './ResourcePanel';
import { api } from '../../services/api';
import '../styles/AITutor.css';

function ChatInterface() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showResources, setShowResources] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ai-tutor/chat/${chatId}`);
      setChat(response.data);
      setMessages(response.data.messages);
    } catch (err) {
      setError(err.message || 'Failed to load chat');
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    const userMessage = messageInput;
    setMessageInput('');
    setSending(true);

    try {
      const response = await api.post(`/ai-tutor/chat/${chatId}/message`, {
        content: userMessage,
      });

      setMessages(response.data.messages);
      setChat(response.data);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessageInput(userMessage);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleEndChat = async () => {
    try {
      await api.post(`/ai-tutor/chat/${chatId}/end`);
      navigate('/ai-tutor');
    } catch (err) {
      console.error('Error ending chat:', err);
    }
  };

  if (loading) {
    return (
      <div className="chat-interface">
        <div className="loading-spinner">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-interface">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="chat-interface-container">
      <div className="chat-interface">
        {/* Header */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate('/ai-tutor')}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-header-info">
            <h1 className="chat-title">
              <BookOpen size={24} />
              {chat?.topic}
            </h1>
            <p className="chat-meta">
              {chat?.difficulty.charAt(0).toUpperCase() + chat?.difficulty.slice(1)} • AI Tutor
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEndChat}
          >
            End Session
          </Button>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {/* Messages */}
          <div className="messages-container">
            <div className="messages-list">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="message-avatar">
                    {msg.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div className="message-bubble">
                    <div className="message-content">
                      {msg.content}
                    </div>
                    <p className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <form className="message-input-area" onSubmit={handleSendMessage}>
            <div className="input-wrapper">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Share your thoughts, ask a question, or analyze the problem..."
                className="message-textarea"
                rows={3}
                disabled={sending}
              />
              <button type="submit" className="send-btn" disabled={sending || !messageInput.trim()}>
                <Send size={18} />
              </button>
            </div>
            <p className="input-hint">
              Socratic learning: the tutor asks guiding questions instead of giving direct answers.
            </p>
          </form>
        </div>
      </div>

      {/* Resources Sidebar */}
      {showResources && (
        <div className="resources-sidebar">
          <div className="resources-header">
            <h3>Learning Resources</h3>
            <button
              className="close-resources"
              onClick={() => setShowResources(false)}
              title="Hide resources"
            >
              <X size={18} />
            </button>
          </div>
          <ResourcePanel topic={chat?.topic} />
        </div>
      )}

      {/* Toggle Resources Button */}
      {!showResources && (
        <button
          className="toggle-resources-btn"
          onClick={() => setShowResources(true)}
          title="Show resources"
        >
          <BookOpen size={20} />
        </button>
      )}
    </div>
  );
}

export default ChatInterface;
