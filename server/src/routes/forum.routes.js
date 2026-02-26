import express from 'express';
import {
  getCategories,
  getPostsByCategory,
  getPost,
  createPost,
  updatePost,
  deletePost,
  createComment,
  deleteComment,
  voteOnPost,
  voteOnComment,
} from '../controllers/forum.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * GET /api/forum/categories
 * Get all forum categories
 */
router.get('/categories', getCategories);

/**
 * GET /api/forum/categories/:categorySlug/posts
 * Get posts by category with sorting and pagination
 */
router.get('/categories/:categorySlug/posts', getPostsByCategory);

/**
 * GET /api/forum/posts/:postId
 * Get single post with comments
 */
router.get('/posts/:postId', getPost);

/**
 * POST /api/forum/posts
 * Create new post (authenticated)
 */
router.post('/posts', verifyToken, createPost);

/**
 * PUT /api/forum/posts/:postId
 * Update post (authenticated, author only)
 */
router.put('/posts/:postId', verifyToken, updatePost);

/**
 * DELETE /api/forum/posts/:postId
 * Delete post (authenticated, author only)
 */
router.delete('/posts/:postId', verifyToken, deletePost);

/**
 * POST /api/forum/posts/:postId/comments
 * Create comment on post (authenticated)
 */
router.post('/posts/:postId/comments', verifyToken, createComment);

/**
 * DELETE /api/forum/comments/:commentId
 * Delete comment (authenticated, author only)
 */
router.delete('/comments/:commentId', verifyToken, deleteComment);

/**
 * POST /api/forum/posts/:postId/vote
 * Vote on post (+1 or -1)
 */
router.post('/posts/:postId/vote', verifyToken, voteOnPost);

/**
 * POST /api/forum/comments/:commentId/vote
 * Vote on comment (+1 or -1)
 */
router.post('/comments/:commentId/vote', verifyToken, voteOnComment);

export default router;
