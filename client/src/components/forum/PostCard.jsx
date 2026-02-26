import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, MessageCircle, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import '../../pages/styles/Forum.css';

function PostCard({ post, onVote, onClick }) {
  const navigate = useNavigate();
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value) => {
    setIsVoting(true);
    const newValue = userVote === value ? 0 : value;
    setUserVote(newValue);
    
    if (onVote) {
      await onVote(post.id, newValue);
    }
    setIsVoting(false);
  };

  const routeToPost = () => {
    navigate(`/forum/posts/${post.id}`);
  };

  return (
    <Card className="post-card" onClick={routeToPost}>
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <span className="post-category">{post.category.name}</span>
      </div>

      <p className="post-preview">{post.content.substring(0, 120)}...</p>

      <div className="post-meta">
        <div className="post-author">
          <img src={post.author.avatar || '/default-avatar.png'} alt={post.author.name} className="author-avatar" />
          <div className="author-info">
            <p className="author-name">{post.author.name}</p>
            <p className="author-xp">Community member</p>
          </div>
        </div>

        <div className="post-stats">
          <div className="stat">
            <Eye size={16} />
            <span>{post.views || 0}</span>
          </div>
          <div className="stat">
            <MessageCircle size={16} />
            <span>{post.commentCount || 0}</span>
          </div>
        </div>
      </div>

      <div
        className="post-vote-section"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <button
          className={`vote-btn ${userVote === 1 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleVote(1);
          }}
          disabled={isVoting}
        >
          <ThumbsUp size={16} />
          <span>{post.upvotes || 0}</span>
        </button>
        <button
          className={`vote-btn ${userVote === -1 ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleVote(-1);
          }}
          disabled={isVoting}
        >
          <ThumbsDown size={16} />
          <span>{(post.downvotes || 0)}</span>
        </button>
      </div>
    </Card>
  );
}

export default PostCard;
