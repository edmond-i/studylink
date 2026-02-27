import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, TrendingUp } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PostCard from '../../components/forum/PostCard';
import { api } from '../../services/api';
import '../styles/Forum.css';

function ForumCategory() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [categorySlug, page, sort]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/forum/categories/${categorySlug}/posts?sort=${sort}&page=${page}&limit=10`
      );
      setPosts(response.data.data);
      
      if (response.data.data.length > 0) {
        setCategory(response.data.data[0].category);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, value) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/vote`, { value });
      
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                upvotes: response.data.upvotes,
                downvotes: response.data.downvotes,
              }
            : post
        )
      );
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="forum-page">
        <div className="loading-spinner">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="forum-header">
        <div className="forum-title-section">
          <h1 className="forum-title">{category?.name || 'Forum'}</h1>
          {/* subtitle removed to avoid duplicate/stray sentence */}
        </div>

        <Button
          onClick={() => navigate('/forum/create')}
          className="create-post-btn"
          size="lg"
        >
          <Plus size={20} />
          New Post
        </Button>
      </div>

      <div className="forum-controls">
        {/* Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
            className="search-input"
          />
        </form>

        {/* Sort Options */}
        <div className="sort-options">
          <button
            className={`sort-btn ${sort === 'new' ? 'active' : ''}`}
            onClick={() => {
              setSort('new');
              setPage(1);
            }}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => {
              setSort('hot');
              setPage(1);
            }}
          >
            <TrendingUp size={16} />
            Hot
          </button>
          <button
            className={`sort-btn ${sort === 'top' ? 'active' : ''}`}
            onClick={() => {
              setSort('top');
              setPage(1);
            }}
          >
            Top
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={handleVote}
            />
          ))
        ) : (
          <div className="no-posts">
            <p>No posts yet in this category. Be the first to post!</p>
            <Button onClick={() => navigate('/forum/create')}>
              Create First Post
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForumCategory;
