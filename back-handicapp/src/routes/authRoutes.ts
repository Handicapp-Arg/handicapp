import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate, authRateLimiter } from '../middleware/auth';
import {
  validateCreateUser,
  validateLogin,
  validateChangePassword,
} from '../validators';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authRateLimiter, validateCreateUser, AuthController.register);
router.post('/login', authRateLimiter, validateLogin, AuthController.login);
router.post('/refresh-token', authRateLimiter, AuthController.refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', AuthController.logout);
router.post('/change-password', validateChangePassword, AuthController.changePassword);
router.get('/profile', AuthController.getProfile);

export { router as authRoutes };
