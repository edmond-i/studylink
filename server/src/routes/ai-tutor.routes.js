import express from 'express';
import {
  startAIChat,
  sendMessage,
  getConversation,
  endChat,
  getSuggestedResources,
} from '../controllers/ai-tutor.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

/**
 * POST /api/ai-tutor/chat/start
 * Start a new AI tutor chat session
 */
router.post('/chat/start', verifyToken, startAIChat);

/**
 * POST /api/ai-tutor/chat/:chatId/message
 * Send message to AI tutor (Socratic method)
 */
router.post('/chat/:chatId/message', verifyToken, sendMessage);

/**
 * GET /api/ai-tutor/chat/:chatId
 * Get full conversation history
 */
router.get('/chat/:chatId', verifyToken, getConversation);

/**
 * POST /api/ai-tutor/chat/:chatId/end
 * End AI chat session and save to history
 */
router.post('/chat/:chatId/end', verifyToken, endChat);

/**
 * GET /api/ai-tutor/resources
 * Get suggested learning resources based on topic
 */
router.get('/resources', verifyToken, getSuggestedResources);

export default router;
