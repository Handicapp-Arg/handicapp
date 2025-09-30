import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { userValidations } from '../middleware/validation';

const router: ExpressRouter = Router();

// Public routes
router.post('/register', userValidations.create, AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Protected routes
router.post('/logout', requireAuth, AuthController.logout);
router.post('/change-password', requireAuth, userValidations.changePassword, AuthController.changePassword);
router.get('/profile', requireAuth, AuthController.getProfile);

export { router as authRoutes };
