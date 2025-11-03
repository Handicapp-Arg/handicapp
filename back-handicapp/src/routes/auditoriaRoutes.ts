import { Router } from 'express';
import { AuditoriaController } from '../controllers/auditoriaController';
import { requireAuth, adminOnly } from '../middleware/auth';

const router: Router = Router();

// All routes require admin access
router.use(requireAuth, adminOnly);

/**
 * @route   GET /api/v1/auditoria
 * @desc    Get audit logs with filters
 * @access  Admin only
 */
router.get('/', AuditoriaController.getAuditorias);

/**
 * @route   GET /api/v1/auditoria/stats
 * @desc    Get audit statistics
 * @access  Admin only
 */
router.get('/stats', AuditoriaController.getStats);

/**
 * @route   GET /api/v1/auditoria/actions
 * @desc    Get unique actions for filters
 * @access  Admin only
 */
router.get('/actions', AuditoriaController.getActions);

/**
 * @route   GET /api/v1/auditoria/entity-types
 * @desc    Get unique entity types for filters
 * @access  Admin only
 */
router.get('/entity-types', AuditoriaController.getEntityTypes);

/**
 * @route   GET /api/v1/auditoria/:id
 * @desc    Get audit log by ID
 * @access  Admin only
 */
router.get('/:id', AuditoriaController.getAuditoriaById);

export default router;
