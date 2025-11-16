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
  static getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const page = Number((req.query['page'] as string) || 1);
    const limit = Number((req.query['limit'] as string) || 10);
    const sortBy = (req.query['sortBy'] as string) || 'creado_el';
    const sortOrder = (req.query['sortOrder'] as string) === 'ASC' ? 'ASC' : 'DESC';
    
    // Filtros opcionales
    const roleId = req.query['roleId'] ? Number(req.query['roleId']) : undefined;
    const estadoUsuario = req.query['estado'] as string | undefined;

    const currentUser = req.user!;
    const currentUserRole = currentUser.rol?.clave;

    // Si es establecimiento, filtrar solo empleados de su establecimiento
    // Si es admin, mostrar todos
    let result;
    if (currentUserRole === 'establecimiento') {
      const query: any = { page, limit, sortBy, sortOrder, roleIds: [3, 4, 5] };
      if (typeof currentUser.establecimiento_id === 'number') {
        query.establecimiento_id = currentUser.establecimiento_id;
      }
      if (estadoUsuario) {
        query.estado_usuario = estadoUsuario;
      }
      result = await UserService.getUsers(query);
    } else {
      const query: any = { page, limit, sortBy, sortOrder };
      if (roleId) {
        query.roleIds = [roleId];
      }
      if (estadoUsuario) {
        query.estado_usuario = estadoUsuario;
      }
      result = await UserService.getUsers(query);
    }

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
    
    if (result.success && result.data) {
      // Recargar el usuario con todas las relaciones para asegurar datos frescos
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['hash_contrasena'] },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }]
      });

      if (!updatedUser) {
        return ResponseHelper.notFound(res, 'Usuario no encontrado');
      }

      const userData = {
        id: updatedUser.id,
        email: updatedUser.email,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        telefono: updatedUser.telefono,
        ubicacion: updatedUser.ubicacion,
        avatar_url: updatedUser.avatar_url,
        verificado: updatedUser.verificado,
        estado_usuario: updatedUser.estado_usuario,
        establecimiento_id: updatedUser.establecimiento_id,
        rol: updatedUser.rol,
        creado_el: updatedUser.creado_el,
        actualizado_el: updatedUser.actualizado_el
      };

      return ResponseHelper.success(res, userData, 'Profile updated successfully');
    }
    
    return ResponseHelper.badRequest(res, result.error || 'Failed to update profile');
  });

  // Get current user profile (re-export from auth controller)
  static getProfile = AuthController.getProfile;

  // Create new user (admin + establecimiento con permisos limitados)
  static createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { nombre, apellido, email, password, rol_id, telefono, documento } = req.body;
    
    const currentUser = req.user!;
    const currentUserRole = currentUser.rol?.clave;
    
    // Verificar permisos según el rol
    if (currentUserRole === 'establecimiento') {
      // Establecimiento solo puede crear: capataz (3), veterinario (4), empleado (5)
      const allowedRoles = [3, 4, 5];
      if (!allowedRoles.includes(rol_id)) {
        return ResponseHelper.forbidden(res, 'Los establecimientos solo pueden crear usuarios con roles: Capataz, Veterinario o Empleado');
      }
    } else if (currentUserRole !== 'admin') {
      return ResponseHelper.forbidden(res, 'No tienes permisos para crear usuarios');
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

      // Si es establecimiento creando un empleado, asignar el establecimiento_id automáticamente
      let establecimientoId = null;
      if (currentUserRole === 'establecimiento' && [3, 4, 5].includes(rol_id)) {
        establecimientoId = currentUser.establecimiento_id;
      }

      // Crear usuario
      const newUser = await User.create({
        nombre,
        apellido,
        email: email.toLowerCase(),
        hash_contrasena: hashedPassword,
        rol_id,
        telefono,
        documento,
        verificado: true,
        estado_usuario: 'active',
        establecimiento_id: establecimientoId
      });

      // Si es establecimiento creando empleado/capataz/veterinario, crear membresía
      if (currentUserRole === 'establecimiento' && [3, 4, 5].includes(rol_id)) {
        // Buscar el establecimiento del usuario que está creando
        const { MembresiaUsuarioEstablecimiento } = require('../models');
        const { EstadoMembresia } = require('../models/enums');
        
        const membresiasEstablecimiento = await MembresiaUsuarioEstablecimiento.findAll({
          where: {
            usuario_id: currentUser.id,
            estado_membresia: EstadoMembresia.active
          }
        });

        // Crear membresía en cada establecimiento del creador
        for (const membresia of membresiasEstablecimiento) {
          await MembresiaUsuarioEstablecimiento.create({
            usuario_id: newUser.id,
            establecimiento_id: membresia.establecimiento_id,
            rol_en_establecimiento: rol_id === 3 ? 'capataz' : rol_id === 4 ? 'veterinario' : 'empleado',
            estado_membresia: EstadoMembresia.active,
            fecha_inicio: new Date()
          });
        }
      }

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

  // Upload avatar
  static uploadAvatar = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
    }

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return ResponseHelper.badRequest(res, 'No se recibió ninguna imagen');
    }

    try {
      // Subir a Cloudinary en carpeta por usuario
      const { uploadImageBufferToCloudinary } = await import('../utils/imageUpload');
      const folder = `handicapp/users/${userId}/avatars`;
      const cloud = await uploadImageBufferToCloudinary(file.buffer, file.originalname || 'avatar', {
        folder,
        publicId: 'avatar', // Siempre el mismo publicId para el avatar del usuario
        overwrite: true,
      });

      if (!cloud.success) {
        return ResponseHelper.internalError(res, cloud.error || 'Error al subir avatar');
      }

      const avatarUrl = cloud.secureUrl || cloud.url || '';

      // Update user with avatar URL de Cloudinary
      const result = await UserService.updateUser(userId.toString(), { 
        avatar_url: avatarUrl 
      } as any);

      if (result.success) {
        return ResponseHelper.success(
          res, 
          { avatar_url: avatarUrl, publicId: cloud.publicId }, 
          'Avatar actualizado exitosamente'
        );
      }
      
      return ResponseHelper.badRequest(res, result.error || 'Error al actualizar avatar');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return ResponseHelper.internalError(res, 'Error al subir avatar');
    }
  });
}