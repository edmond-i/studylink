import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getLeaderboard,
  getUserBadges,
  getAllBadges,
  getUserRank,
  getLeaderboardStats,
} from '../controllers/leaderboard.fixed.controller.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * Get leaderboard with top users by XP
 * @query limit - Number of users (default: 50)
 * @query timeframe - 'weekly', 'monthly', 'all' (default: 'all')
 */
router.get('/', verifyToken, getLeaderboard);

/**
 * GET /api/leaderboard/user/:userId/badges
 * Get all badges earned by a specific user
 */
router.get('/user/:userId/badges', verifyToken, getUserBadges);

/**
 * GET /api/leaderboard/badges
 * Get all available badges in the system
 */
router.get('/badges/all', verifyToken, getAllBadges);

/**
 * GET /api/leaderboard/user/:userId/rank
 * Get user's rank and stats
 */
router.get('/user/:userId/rank', verifyToken, getUserRank);

/**
 * GET /api/leaderboard/stats
 * Get overall leaderboard statistics
 */
router.get('/stats', verifyToken, getLeaderboardStats);

export default router;
