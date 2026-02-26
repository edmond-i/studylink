import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import {
  getCategories,
  getResources,
  getResourceById,
  saveResource,
  getSavedResources,
  removeSavedResource,
  createResource,
} from '../controllers/resources.controller.js';

const router = express.Router();

/**
 * GET /api/resources/categories
 * Get all resource categories
 */
router.get('/categories', getCategories);

/**
 * GET /api/resources
 * Get resources with optional filtering
 * @query category - Filter by category
 * @query search - Search resources
 * @query limit - Number of results (default: 20)
 * @query offset - Pagination offset (default: 0)
 */
router.get('/', getResources);

/**
 * GET /api/resources/:resourceId
 * Get a specific resource
 */
router.get('/:resourceId', getResourceById);

/**
 * POST /api/resources/save
 * Save a resource to user's library
 */
router.post('/:resourceId/save', verifyToken, saveResource);

/**
 * GET /api/resources/saved
 * Get user's saved resources
 */
router.get('/saved/list', verifyToken, getSavedResources);

/**
 * DELETE /api/resources/:resourceId/save
 * Remove a resource from user's library
 */
router.delete('/:resourceId/save', verifyToken, removeSavedResource);

/**
 * POST /api/resources
 * Create a new resource (admin only)
 */
router.post('/', verifyToken, createResource);

export default router;
