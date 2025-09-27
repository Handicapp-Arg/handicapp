import { Router, type Router as ExpressRouter } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, adminOnly } from '../middleware/auth';
import { 
  validateUpdateUser, 
  validateId, 
  validatePagination,
  validateCreateUser,
  validateChangePassword 
} from '../validators';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// User profile routes (user can access their own profile)
router.get('/profile', UserController.getProfile);
router.put('/profile', validateUpdateUser, UserController.updateProfile);

// Admin only routes
router.get('/', adminOnly, validatePagination, UserController.getUsers);
router.post('/', adminOnly, validateCreateUser, UserController.createUser);
router.get('/roles', adminOnly, UserController.getRoles);
router.get('/stats', adminOnly, UserController.getUserStats);
router.get('/search', adminOnly, validatePagination, UserController.searchUsers);

// User management routes (admin only)
router.get('/:id', adminOnly, validateId, UserController.getUserById);
router.put('/:id', adminOnly, validateId, validateUpdateUser, UserController.updateUser);
router.delete('/:id', adminOnly, validateId, UserController.deleteUser);
router.patch('/:id/toggle-status', adminOnly, validateId, UserController.toggleUserStatus);
router.put('/:id/change-password', adminOnly, validateId, validateChangePassword, UserController.changePassword);

export { router as userRoutes };
