import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { CreateUserData, LoginData } from '../types';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userData: CreateUserData = req.body;
    // TODO: Implement register method in AuthService
    return ResponseHelper.badRequest(res, 'Register not implemented yet');
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData: LoginData = req.body;

    try {
      const result = await AuthService.login(loginData);

      if (result.success) {
        return ResponseHelper.success(res, result.data, 'Login successful');
      }

      return ResponseHelper.badRequest(res, result.error || 'Login failed');
    } catch (error) {
      throw error;
    }
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHelper.badRequest(res, 'Refresh token is required');
    }

    // TODO: Implement refreshToken method in AuthService
    return ResponseHelper.badRequest(res, 'RefreshToken not implemented yet');
  });

  // Logout user
  static logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    // TODO: Implement logout method in AuthService
    return ResponseHelper.success(res, null, 'Logout successful');
  });

  // Change password
  static changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    // TODO: Implement changePassword method in AuthService
    return ResponseHelper.badRequest(res, 'ChangePassword not implemented yet');
  });

  // Get current user profile
  static getProfile = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    return ResponseHelper.success(res, user, 'Profile retrieved successfully');
  });

  // Debug endpoint - temporal para verificar usuarios
  static debugUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      const { sequelize } = await import('../config/database');
      
      // Query raw SQL para obtener usuarios y roles
      const [users] = await sequelize.query(`
        SELECT 
          u.id,
          u.email,
          u.nombre,
          u.apellido,
          u.verificado,
          u.estado_usuario,
          u.rol_id,
          r.clave as rol_clave,
          r.nombre as rol_nombre,
          CASE 
            WHEN u.hash_contrasena IS NOT NULL 
            THEN CONCAT(SUBSTR(u.hash_contrasena, 1, 10), '...')
            ELSE 'NULL'
          END as hash_preview
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        ORDER BY u.id
      `);

      return ResponseHelper.success(res, users, 'Debug users retrieved successfully');
    } catch (error) {
      return ResponseHelper.internalError(res, 'Error retrieving debug info');
    }
  });
}
