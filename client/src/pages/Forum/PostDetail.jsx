import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Comment from '../../components/forum/Comment';
import CommentForm from '../../components/forum/CommentForm';
import { api } from '../../services/api';
import '../styles/Forum.css';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/forum/posts/${postId}`);
      setPost(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch post');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value) => {
    try {
      setIsVoting(true);
      const newValue = userVote === value ? 0 : value;
      setUserVote(newValue);
      
      const response = await api.post(`/forum/posts/${postId}/vote`, { value: newValue });
      
      setPost((prev) => ({
        ...prev,
        upvotes: response.data.upvotes,
        downvotes: response.data.downvotes,
      }));
    } catch (err) {
      console.error('Error voting:', err);
      setUserVote(0);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCommentSubmit = async (content) => {
    try {
      const response = await api.post(`/forum/posts/${postId}/comments`, {
        content,
      });
      
      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data],
      }));
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await api.delete(`/forum/comments/${commentId}`);
      
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (loading) return <div className="loading-spinner">Loading post...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="error-message">Post not found</div>;

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        <Card className="post-detail-card">
          {/* Post Header */}
          <div className="post-detail-header">
            <div className="post-detail-title-section">
              <h1 className="post-detail-title">{post.title}</h1>
              <span className="post-detail-category">{post.category.name}</span>
            </div>

            <div className="post-detail-author">
              <img
                src={post.author.avatar || '/default-avatar.png'}
                alt={post.author.name}
                className="post-detail-avatar"
              />
              <div className="author-info-detail">
                <p className="author-name">{post.author.name}</p>
                <p className="author-meta">Community contributor</p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="post-detail-content">
            <p>{post.content}</p>
          </div>

          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag.id} className="tag">
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="post-detail-actions">
            <div className="vote-section">
              <button
                className={`vote-btn-large ${userVote === 1 ? 'active' : ''}`}
                onClick={() => handleVote(1)}
                disabled={isVoting}
              >
                <ArrowUp size={20} />
                <span>{post.upvotes || 0}</span>
              </button>
              <button
                className={`vote-btn-large ${userVote === -1 ? 'active' : ''}`}
                onClick={() => handleVote(-1)}
                disabled={isVoting}
              >
                <ArrowDown size={20} />
                <span>{post.downvotes || 0}</span>
              </button>
            </div>

            <Button variant="secondary" size="sm">
              <Share2 size={18} />
              Share
            </Button>
            <Button variant="secondary" size="sm">
              <Bookmark size={18} />
              Save
            </Button>
          </div>
        </Card>

        {/* Comments Section */}
        <div className="comments-section">
          <h2 className="comments-title">
            <MessageCircle size={20} />
            Comments ({post.comments?.length || 0})
          </h2>

          {/* New Comment Form */}
          <CommentForm
            onSubmit={handleCommentSubmit}
            placeholder="Share your thoughts..."
          />

          {/* Comments List */}
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onVote={handleCommentDelete}
                  onDelete={handleCommentDelete}
                />
              ))
            ) : (
              <p className="no-comments">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;
