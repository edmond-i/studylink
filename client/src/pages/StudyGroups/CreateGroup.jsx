import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Globe } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import '../styles/StudyGroups.css';

function CreateGroup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPublic: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['general', 'math', 'science', 'languages', 'business', 'arts'];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || formData.name.length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/groups', formData);
      navigate(`/groups/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
      console.error('Error creating group:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        {/* Header */}
        <div className="cg-header">
          <button className="back-btn" onClick={() => navigate('/groups')}>
            <ArrowLeft size={20} />
          </button>
          <h1>Create a New Study Group</h1>
        </div>

        {/* Form Card */}
        <Card className="create-group-form-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-banner">{error}</div>}

            {/* Group Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Group Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="e.g., Advanced Calculus Study Group"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <p className="form-hint">{formData.name.length} / 100 characters</p>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="What's this group about? What topics will you study?"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Privacy */}
            <div className="form-group">
              <label className="form-label">Privacy</label>
              <div className="privacy-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="isPublic"
                    value={true}
                    checked={formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                  />
                  <div className="radio-content">
                    <Globe size={18} />
                    <div>
                      <p className="radio-label">Public</p>
                      <p className="radio-desc">Anyone can find and join this group</p>
                    </div>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="isPublic"
                    value={false}
                    checked={!formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                  />
                  <div className="radio-content">
                    <Lock size={18} />
                    <div>
                      <p className="radio-label">Private</p>
                      <p className="radio-desc">Only invited members can join</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="form-actions">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate('/groups')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips */}
        <Card className="tips-card">
          <h3 className="tips-title">Tips for a Great Study Group</h3>
          <ul className="tips-list">
            <li>Choose a clear, descriptive name for your group</li>
            <li>Write a detailed description so members know what to expect</li>
            <li>Start with a general channel, then add specialized topics</li>
            <li>Be welcoming and inclusive to new members</li>
            <li>Keep discussions focused on learning and study topics</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default CreateGroup;
