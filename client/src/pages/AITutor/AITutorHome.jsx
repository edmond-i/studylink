import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import '../styles/AITutor.css';

function AITutorHome() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const suggestedTopics = [
    { label: 'Calculus', value: 'calculus' },
    { label: 'Physics', value: 'physics' },
    { label: 'Chemistry', value: 'chemistry' },
    { label: 'History', value: 'history' },
    { label: 'Programming', value: 'programming' },
    { label: 'Literature', value: 'literature' },
  ];

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/ai-tutor/chat/start', {
        topic: topic.trim(),
        difficulty,
      });

      navigate(`/ai-tutor/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start chat');
      console.error('Error starting chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedTopic = (topicValue) => {
    setTopic(topicValue);
  };

  return (
    <div className="ai-tutor-home">
      {/* Hero Section */}
      <div className="at-hero">
        <div className="at-hero-content">
          <div className="at-hero-icon">
            <BookOpen size={48} />
          </div>
          <h1 className="at-hero-title">Your Personal AI Tutor</h1>
          <p className="at-hero-subtitle">
            Learn through Socratic questioning. Ask anything, get guided to understanding.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="at-container">
        <Card className="at-form-card">
          <h2 className="at-form-title">What would you like to learn?</h2>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleStartChat}>
            {/* Topic Input */}
            <div className="form-group">
              <label htmlFor="topic" className="form-label">
                Topic or Question
              </label>
              <Input
                id="topic"
                type="text"
                placeholder="e.g., Python decorators, Photosynthesis, World War 2..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Difficulty Selection */}
            <div className="form-group">
              <label className="form-label">Difficulty Level</label>
              <div className="difficulty-options">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <label key={level} className="radio-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={(e) => setDifficulty(e.target.value)}
                      disabled={loading}
                    />
                    <span className="radio-label">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              disabled={loading || !topic.trim()}
              className="start-btn"
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Starting...
                </>
              ) : (
                'Start Learning'
              )}
            </Button>
          </form>
        </Card>

        {/* Suggested Topics */}
        <div className="suggested-topics-section">
          <h3 className="section-title">Popular Topics</h3>
          <div className="suggested-topics-grid">
            {suggestedTopics.map((t) => (
              <button
                key={t.value}
                className="topic-card"
                onClick={() => {
                  handleSuggestedTopic(t.value);
                  setTopic(t.value);
                }}
              >
                <span className="topic-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h3 className="section-title">How It Works</h3>
          <div className="features-grid">
            <Card className="feature-card">
              <h4>Socratic Method</h4>
              <p>Learn through guided questions that build your understanding</p>
            </Card>
            <Card className="feature-card">
              <h4>Resources</h4>
              <p>Get curated learning materials tailored to your topic</p>
            </Card>
            <Card className="feature-card">
              <h4>Adaptive</h4>
              <p>Difficulty adjusts based on your knowledge level</p>
            </Card>
            <Card className="feature-card">
              <h4>Always Available</h4>
              <p>Learn whenever you want, at your own pace</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AITutorHome;
