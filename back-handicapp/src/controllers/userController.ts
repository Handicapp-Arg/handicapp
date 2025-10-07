import { Request, Response, NextFunction } from 'express';
import { AuthController } from './authController';
import { UserService } from '../services/userService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { UpdateUserData, AuthenticatedRequest } from '../types';
import { User } from '../models/User';
import { Role } from '../models/roles';
import bcrypt from 'bcrypt';
import { config } from '../config/config';

export class UserController {
  // Get all users
  static getUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
  const page = Number((_req.query['page'] as string) || 1);
  const limit = Number((_req.query['limit'] as string) || 10);
  const sortBy = (_req.query['sortBy'] as string) || 'creado_el';
  const sortOrder = (_req.query['sortOrder'] as string) === 'ASC' ? 'ASC' : 'DESC';

    const result = await UserService.getUsers({ page, limit, sortBy, sortOrder });
    return ResponseHelper.success(res, result.data, 'Users retrieved successfully');
  });

  // Get user by ID
  static getUserById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    
    if (!id) {
      return ResponseHelper.badRequest(res, 'User ID is required');
    }
    
    const result = await UserService.getUserById(id);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'User retrieved successfully');
    }
    
    return ResponseHelper.notFound(res, result.error || 'User not found');
  });

  // Update user
  static updateUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    
    if (!id) {
      return ResponseHelper.badRequest(res, 'User ID is required');
    }
    
    const updateData: UpdateUserData = req.body;
    
    const result = await UserService.updateUser(id, updateData);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'User updated successfully');
    }
    
    return ResponseHelper.badRequest(res, result.error || 'Failed to update user');
  });

  // Delete user
  static deleteUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    
    if (!id) {
      return ResponseHelper.badRequest(res, 'User ID is required');
    }
    
    const result = await UserService.deleteUser(id);
    
    if (result.success) {
      return ResponseHelper.success(res, null, 'User deleted successfully');
    }
    
    return ResponseHelper.notFound(res, result.error || 'User not found');
  });

  // Toggle user status
  static toggleUserStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    
    if (!id) {
      return ResponseHelper.badRequest(res, 'User ID is required');
    }
    
    const result = await UserService.toggleUserStatus(id);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'User status updated successfully');
    }
    
    return ResponseHelper.notFound(res, result.error || 'User not found');
  });

  // Search users
  static searchUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return ResponseHelper.badRequest(res, 'Search query is required');
    }

  const page = Number((req.query['page'] as string) || 1);
  const limit = Number((req.query['limit'] as string) || 10);
  const sortBy = (req.query['sortBy'] as string) || 'creado_el';
  const sortOrder = (req.query['sortOrder'] as string) === 'ASC' ? 'ASC' : 'DESC';

    const result = await UserService.searchUsers(q, { page, limit, sortBy, sortOrder });
    return ResponseHelper.success(res, result.data, 'Search completed successfully');
  });

  // Get user statistics
  static getUserStats = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await UserService.getUserStats();
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Statistics retrieved successfully');
    }
    
    return ResponseHelper.internalError(res, result.error || 'Failed to fetch statistics');
  });

  // Update current user profile
  static updateProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const updateData: UpdateUserData = req.body;
    
    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }
    
    const result = await UserService.updateUser(userId.toString(), updateData);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Profile updated successfully');
    }
    
    return ResponseHelper.badRequest(res, result.error || 'Failed to update profile');
  });

  // Get current user profile (re-export from auth controller)
  static getProfile = AuthController.getProfile;

  // Create new user (admin only)
  static createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { nombre, apellido, email, password, rol_id, telefono } = req.body;
    
    // Verificar que el usuario actual es admin
    const currentUser = req.user!;
    if (currentUser.rol?.clave !== 'admin') {
      return ResponseHelper.forbidden(res, 'Solo los administradores pueden crear usuarios');
    }

    try {
      // Verificar que el email no exista
      const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
      if (existingUser) {
        return ResponseHelper.badRequest(res, 'El email ya está registrado');
      }

      // Hash de la contraseña
      const salt = await bcrypt.genSalt(config.security.bcryptRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear usuario
      const newUser = await User.create({
        nombre,
        apellido,
        email: email.toLowerCase(),
        hash_contrasena: hashedPassword,
        rol_id,
        telefono,
        verificado: true,
        estado_usuario: 'active'
      });

      // Obtener usuario con rol
      const userWithRole = await User.findByPk(newUser.id, {
        include: [{ model: Role, as: 'rol', attributes: ['id', 'nombre', 'clave'] }],
        attributes: { exclude: ['hash_contrasena'] }
      });

      return ResponseHelper.success(res, { user: userWithRole }, 'Usuario creado exitosamente', 201);
    } catch (error) {
      console.error('Error creating user:', error);
      return ResponseHelper.internalError(res, 'Error al crear usuario');
    }
  });

  // Get roles (for dropdowns)
  static getRoles = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    // Retornando roles simples para que funcione
    return ResponseHelper.success(res, {
      roles: [
        { id: 1, nombre: 'Administrador', clave: 'admin' },
        { id: 2, nombre: 'Establecimiento', clave: 'establecimiento' },
        { id: 3, nombre: 'Capataz', clave: 'capataz' },
        { id: 4, nombre: 'Veterinario', clave: 'veterinario' },
        { id: 5, nombre: 'Empleado', clave: 'empleado' },
        { id: 6, nombre: 'Propietario', clave: 'propietario' }
      ]
    }, 'Roles obtenidos exitosamente');
  });

  // Change user password
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const currentUser = req.user!;

    // Verificar permisos
    const isAdmin = currentUser.rol?.clave === 'admin';
    const isOwnProfile = currentUser.id === parseInt(id!);

    if (!isAdmin && !isOwnProfile) {
      return ResponseHelper.forbidden(res, 'No tienes permisos para cambiar esta contraseña');
    }

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return ResponseHelper.notFound(res, 'Usuario no encontrado');
      }

      // Si no es admin, verificar contraseña actual
      if (!isAdmin) {
        const isValidPassword = await user.validatePassword(currentPassword);
        if (!isValidPassword) {
          return ResponseHelper.badRequest(res, 'Contraseña actual incorrecta');
        }
      }

      // Hash nueva contraseña
      const salt = await bcrypt.genSalt(config.security.bcryptRounds);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await user.update({ hash_contrasena: hashedPassword });

      return ResponseHelper.success(res, null, 'Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error changing password:', error);
      return ResponseHelper.internalError(res, 'Error al cambiar contraseña');
    }
  });
}