import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import '../../pages/styles/Forum.css';

function CommentForm({ onSubmit, isLoading = false, placeholder = 'Add a comment...', isReply = false }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <form className={`comment-form ${isReply ? 'reply-form' : ''}`} onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="comment-textarea"
        rows={isReply ? 2 : 4}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="sm"
        disabled={isLoading || !content.trim()}
      >
        {isLoading ? 'Posting...' : isReply ? 'Reply' : 'Post Comment'}
      </Button>
    </form>
  );
}

export default CommentForm;
