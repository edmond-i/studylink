import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import '../styles/Forum.css';

function CreatePost() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [],
  });

  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/forum/categories');
      setCategories(response.data);
      if (response.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          categoryId: response.data[0].id,
        }));
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post('/forum/posts', {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        tags: formData.tags,
      });

      navigate(`/forum/posts/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="create-post-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        {/* Header */}
        <div className="create-post-header">
          <button
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Create a New Post</h1>
        </div>

        {/* Form Card */}
        <Card className="create-post-form-card">
          <form onSubmit={handleSubmit}>
            {error && <div className="error-banner">{error}</div>}

            {/* Category Selection */}
            <div className="form-group">
              <label htmlFor="categoryId" className="form-label">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="What's your question or topic?"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                required
              />
              <p className="form-hint">
                {formData.title.length} / 200 characters
              </p>
            </div>

            {/* Content */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Description *
              </label>
              <textarea
                id="content"
                name="content"
                placeholder="Provide details about your question or topic..."
                value={formData.content}
                onChange={handleInputChange}
                className="form-textarea"
                rows={8}
                required
              />
              <p className="form-hint">
                {formData.content.length} characters
              </p>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags (up to 5)
              </label>
              <div className="tag-input-group">
                <Input
                  id="tags"
                  type="text"
                  placeholder="Add tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="form-input"
                />
                <button
                  type="button"
                  className="add-tag-btn"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || formData.tags.length >= 5}
                >
                  <Plus size={18} />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="tags-display">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag-badge">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove-btn"
                        onClick={() => handleRemoveTag(index)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips Section */}
        <Card className="tips-card">
          <h3 className="tips-title">Tips for a Great Post</h3>
          <ul className="tips-list">
            <li>Be clear and descriptive with your title</li>
            <li>Provide context and details in your description</li>
            <li>Use tags to help others find your post</li>
            <li>Check if your question has been asked before</li>
            <li>Be respectful and follow community guidelines</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default CreatePost;
