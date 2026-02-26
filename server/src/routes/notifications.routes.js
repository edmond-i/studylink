import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from '../controllers/notifications.controller.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for current user
 * @query limit - Number of notifications (default: 20)
 * @query offset - Pagination offset (default: 0)
 */
router.get('/', verifyToken, getNotifications);

/**
 * PATCH /api/notifications/:notificationId/read
 * Mark a specific notification as read
 */
router.patch('/:notificationId/read', verifyToken, markAsRead);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch('/read-all', verifyToken, markAllAsRead);

/**
 * DELETE /api/notifications/:notificationId
 * Delete a notification
 */
router.delete('/:notificationId', verifyToken, deleteNotification);

/**
 * GET /api/notifications/unread/count
 * Get count of unread notifications
 */
router.get('/unread/count', verifyToken, getUnreadCount);

export default router;
