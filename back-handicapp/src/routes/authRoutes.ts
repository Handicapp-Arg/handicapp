import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  validateCreateUser,
  validateChangePassword,
} from '../validators';

const router: ExpressRouter = Router();

// Public routes
router.post('/register', validateCreateUser, AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, validateChangePassword, AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);

export { router as authRoutes };
