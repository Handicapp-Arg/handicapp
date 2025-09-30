import { Router, type Router as ExpressRouter } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth, adminOnly } from '../middleware/auth';
import { userValidations, paramValidations } from '../middleware/validation';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(requireAuth);

// User profile routes (user can access their own profile)
router.get('/profile', UserController.getProfile);
router.put('/profile', userValidations.update, UserController.updateProfile);

// Admin only routes
router.get('/', adminOnly, paramValidations.pagination, UserController.getUsers);
router.post('/', adminOnly, userValidations.create, UserController.createUser);
router.get('/roles', adminOnly, UserController.getRoles);
router.get('/stats', adminOnly, UserController.getUserStats);
router.get('/search', adminOnly, paramValidations.pagination, UserController.searchUsers);

// User management routes (admin only)
router.get('/:id', adminOnly, paramValidations.id, UserController.getUserById);
router.put('/:id', adminOnly, paramValidations.id, userValidations.update, UserController.updateUser);
router.delete('/:id', adminOnly, paramValidations.id, UserController.deleteUser);
router.patch('/:id/toggle-status', adminOnly, paramValidations.id, UserController.toggleUserStatus);
router.put('/:id/change-password', adminOnly, paramValidations.id, userValidations.changePassword, UserController.changePassword);

export { router as userRoutes };
