import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  validateCreateUser,
  validateChangePassword,
} from '../validators';

const router = Router();

// Public routes (rate limiting temporalmente deshabilitado para pruebas)
router.post('/register', validateCreateUser, AuthController.register);
router.post('/login', AuthController.login); // REMOVED validateLogin
router.post('/refresh-token', AuthController.refreshToken);

// Debug route - temporal (público para debug)
router.get('/debug-users', AuthController.debugUsers);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', AuthController.logout);
router.post('/change-password', validateChangePassword, AuthController.changePassword);
router.get('/profile', AuthController.getProfile);

export { router as authRoutes };
