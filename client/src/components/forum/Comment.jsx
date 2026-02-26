import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import '../../pages/styles/Forum.css';

function Comment({ comment, onVote, onDelete, depth = 0, isReply = false }) {
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [userVote, setUserVote] = useState(0);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value) => {
    setIsVoting(true);
    const newValue = userVote === value ? 0 : value;
    setUserVote(newValue);
    
    if (onVote) {
      await onVote(comment.id, newValue);
    }
    setIsVoting(false);
  };

  return (
    <div className={`comment-container ${isReply ? 'is-reply' : ''}`} style={{ marginLeft: `${depth * 24}px` }}>
      <div className="comment-body">
        <div className="comment-header">
          <div className="comment-author">
            <img
              src={comment.author.avatar || '/default-avatar.png'}
              alt={comment.author.name}
              className="comment-avatar"
            />
            <div className="author-info">
              <p className="comment-author-name">{comment.author.name}</p>
              <p className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <p className="comment-text">{comment.content}</p>

        <div className="comment-footer">
          <div className="comment-votes">
            <button
              className={`vote-btn-small ${userVote === 1 ? 'active' : ''}`}
              onClick={() => handleVote(1)}
              disabled={isVoting}
            >
              <ThumbsUp size={14} />
              <span>{comment.votes?.filter((v) => v.value === 1).length || 0}</span>
            </button>
            <button
              className={`vote-btn-small ${userVote === -1 ? 'active' : ''}`}
              onClick={() => handleVote(-1)}
              disabled={isVoting}
            >
              <ThumbsDown size={14} />
              <span>{comment.votes?.filter((v) => v.value === -1).length || 0}</span>
            </button>
          </div>

          {depth < 2 && (
            <button
              className="reply-btn"
              onClick={() => setIsReplyOpen(!isReplyOpen)}
            >
              Reply
            </button>
          )}

          {onDelete && (
            <button className="delete-btn" onClick={() => onDelete(comment.id)}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onVote={onVote}
              onDelete={onDelete}
              depth={depth + 1}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;
