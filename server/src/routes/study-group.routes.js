import express from 'express';
import {
  getStudyGroups,
  getGroupById,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  getGroupMembers,
  inviteToGroup,
  leaveGroup,
  removeGroupMember,
  getChannels,
  createChannel,
  getMessages,
  sendMessage,
  deleteMessage,
} from '../controllers/study-group.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * GET /api/groups
 * Get all study groups (paginated, searchable)
 */
router.get('/', verifyToken, getStudyGroups);

/**
 * POST /api/groups
 * Create new study group
 */
router.post('/', verifyToken, createStudyGroup);

/**
 * GET /api/groups/:groupId
 * Get single study group
 */
router.get('/:groupId', verifyToken, getGroupById);

/**
 * PUT /api/groups/:groupId
 * Update study group
 */
router.put('/:groupId', verifyToken, updateStudyGroup);

/**
 * DELETE /api/groups/:groupId
 * Delete study group
 */
router.delete('/:groupId', verifyToken, deleteStudyGroup);

/**
 * GET /api/groups/:groupId/members
 * Get group members
 */
router.get('/:groupId/members', verifyToken, getGroupMembers);

/**
 * POST /api/groups/:groupId/invite
 * Invite user to group (by email)
 */
router.post('/:groupId/invite', verifyToken, inviteToGroup);

/**
 * POST /api/groups/:groupId/leave
 * Leave group
 */
router.post('/:groupId/leave', verifyToken, leaveGroup);

/**
 * DELETE /api/groups/:groupId/members/:memberId
 * Remove member from group (admin only)
 */
router.delete('/:groupId/members/:memberId', verifyToken, removeGroupMember);

/**
 * GET /api/groups/:groupId/channels
 * Get all channels in group
 */
router.get('/:groupId/channels', verifyToken, getChannels);

/**
 * POST /api/groups/:groupId/channels
 * Create new channel
 */
router.post('/:groupId/channels', verifyToken, createChannel);

/**
 * GET /api/channels/:channelId/messages
 * Get messages from channel (paginated)
 */
router.get('/channels/:channelId/messages', verifyToken, getMessages);

/**
 * POST /api/channels/:channelId/messages
 * Send message to channel
 */
router.post('/channels/:channelId/messages', verifyToken, sendMessage);

/**
 * DELETE /api/messages/:messageId
 * Delete message (author only)
 */
router.delete('/messages/:messageId', verifyToken, deleteMessage);

export default router;
