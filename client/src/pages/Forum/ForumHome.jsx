import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, TrendingUp, Users, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import '../styles/Forum.css';

function ForumHome() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingPosts, setTrendingPosts] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTrendingPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/forum/categories');
      setCategories(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      // Fetch from all categories sorted by hot
      const response = await api.get('/forum/categories/general/posts?sort=hot&limit=5');
      setTrendingPosts(response.data.data);
    } catch (err) {
      console.error('Error fetching trending posts:', err);
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/forum/categories/${slug}`);
  };

  if (loading) {
    return (
      <div className="forum-home">
        <div className="loading-spinner">Loading forum...</div>
      </div>
    );
  }

  return (
    <div className="forum-home">
      {/* Hero Section */}
      <div className="forum-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <MessageSquare size={32} />
            Community Forum
          </h1>
          {/* subtitle removed per design feedback; text was flashing as
              page loaded and created a distracting floating sentence */}
          <Button
            size="lg"
            onClick={() => navigate('/forum/create')}
            className="hero-cta"
          >
            Start a Discussion
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="forum-stats">
        <div className="stat-item">
          <MessageSquare size={20} />
          <div>
            <p className="stat-label">Total Posts</p>
            <p className="stat-value">{categories.reduce((sum, cat) => sum + (cat._count?.posts || 0), 0)}</p>
          </div>
        </div>
        <div className="stat-item">
          <Users size={20} />
          <div>
            <p className="stat-label">Active Members</p>
            <p className="stat-value">2,451</p>
          </div>
        </div>
        <div className="stat-item">
          <TrendingUp size={20} />
          <div>
            <p className="stat-label">Questions Answered</p>
            <p className="stat-value">12,841</p>
          </div>
        </div>
        <div className="stat-item">
          <Sparkles size={20} />
          <div>
            <p className="stat-label">Weekly Activity</p>
            <p className="stat-value">548,223</p>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="categories-section">
        <h2 className="section-title">Browse Categories</h2>
        <div className="categories-grid">
          {error && <div className="error-message">{error}</div>}
          {categories.map((category) => (
            <Card
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <div className="category-header">
                <div
                  className="category-icon"
                  style={{ backgroundColor: category.color || 'var(--primary)' }}
                >
                  <MessageSquare size={24} />
                </div>
                <h3 className="category-name">{category.name}</h3>
              </div>

              <p className="category-posts">
                {category._count?.posts || 0} posts
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Posts */}
      {trendingPosts.length > 0 && (
        <div className="trending-section">
          <h2 className="section-title">
            <TrendingUp size={24} />
            Trending Now
          </h2>
          <div className="trending-posts">
            {trendingPosts.map((post) => (
              <Card
                key={post.id}
                className="trending-post"
                onClick={() => navigate(`/forum/posts/${post.id}`)}
              >
                <p className="trending-title">{post.title}</p>
                <p className="trending-meta">
                  {post.upvotes} upvotes • {post.commentCount} comments
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="forum-cta">
        <h2>Ready to contribute?</h2>
        <p>Join our community and help answer questions</p>
        <Button size="lg">Get Started</Button>
      </div>
    </div>
  );
}

export default ForumHome;
