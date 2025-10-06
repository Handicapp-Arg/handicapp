import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { userValidations } from '../middleware/validation';

const router: ExpressRouter = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', userValidations.create, AuthController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token)
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   GET /api/v1/auth/verify
 * @desc    Verify access token
 * @access  Protected
 */
router.get('/verify', requireAuth, AuthController.verifyToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Protected
 */
router.post('/logout', requireAuth, AuthController.logout);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Protected
 */
router.post('/change-password', requireAuth, userValidations.changePassword, AuthController.changePassword);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/profile', requireAuth, AuthController.getProfile);

/**
 * @route   GET /api/v1/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (_req, res) => res.json({ 
  status: 'ok', 
  timestamp: new Date().toISOString(),
  service: 'handicapp-auth'
}));

export { router as authRoutes };
