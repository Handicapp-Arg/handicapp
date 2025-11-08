import { Router, type Router as ExpressRouter } from 'express';
import { UserController } from '../controllers/userController';
import { requireAuth, adminOnly } from '../middleware/auth';
import { requirePermission } from '../middleware/authorization';
import { userValidations, paramValidations } from '../middleware/validation';
import { uploader } from '../controllers/uploadController';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(requireAuth);

// User profile routes (user can access their own profile)
router.get('/profile', UserController.getProfile);
router.put('/profile', userValidations.update, UserController.updateProfile);
router.post('/avatar', uploader.single('avatar'), UserController.uploadAvatar);

// Admin + establecimiento pueden ver usuarios
router.get('/', requirePermission('users:read'), paramValidations.pagination, UserController.getUsers);
router.post('/', requirePermission('users:write'), userValidations.create, UserController.createUser); // ✅ Permite establecimiento crear usuarios
router.get('/roles', adminOnly, UserController.getRoles);
router.get('/stats', adminOnly, UserController.getUserStats);
router.get('/search', adminOnly, paramValidations.pagination, UserController.searchUsers);

// User management routes (admin + establecimiento con users:write)
router.get('/:id', requirePermission('users:read'), paramValidations.id, UserController.getUserById);
router.put('/:id', requirePermission('users:write'), paramValidations.id, userValidations.update, UserController.updateUser); // ✅ Permite establecimiento editar usuarios
router.delete('/:id', requirePermission('users:write'), paramValidations.id, UserController.deleteUser); // ✅ Permite establecimiento eliminar usuarios
router.patch('/:id/toggle-status', requirePermission('users:write'), paramValidations.id, UserController.toggleUserStatus); // ✅ Permite establecimiento cambiar estado
router.put('/:id/change-password', adminOnly, paramValidations.id, userValidations.changePassword, UserController.changePassword);

export { router as userRoutes };
