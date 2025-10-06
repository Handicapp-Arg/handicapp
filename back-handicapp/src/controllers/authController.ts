import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { LoginData, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export class AuthController {
  
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    // TODO: Implement register method in AuthService
    return ResponseHelper.badRequest(res, 'Register not implemented yet');
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData: LoginData = req.body;

    // Validación básica
    if (!loginData.email || !loginData.password) {
      return ResponseHelper.badRequest(res, 'Email y contraseña son requeridos');
    }

    try {
      const result = await AuthService.login(loginData);

      if (result.success && result.data) {
        // Configurar refresh token como httpOnly cookie
        res.cookie('refreshToken', result.data.refreshToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
          path: '/api/v1/auth/refresh'
        });

        // Retornar solo access token y datos del usuario
        const responseData = {
          user: result.data.user,
          accessToken: result.data.accessToken,
          expiresIn: result.data.expiresIn
        };

        return ResponseHelper.success(res, responseData, result.message);
      }

      return ResponseHelper.badRequest(res, result.error || 'Login failed');
    } catch (error: any) {
      logger.error('Error en login controller:', error.message || error);
      throw error;
    }
  });

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return ResponseHelper.unauthorized(res, 'Refresh token requerido');
    }

    try {
      const result = await AuthService.refreshToken(refreshToken);

      if (result.success && result.data) {
        // Actualizar refresh token cookie
        res.cookie('refreshToken', result.data.refreshToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
          path: '/api/v1/auth/refresh'
        });

        const responseData = {
          accessToken: result.data.accessToken,
          expiresIn: result.data.expiresIn
        };

        return ResponseHelper.success(res, responseData, 'Token refrescado exitosamente');
      }

      return ResponseHelper.unauthorized(res, result.error || 'Refresh token inválido');
    } catch (error: any) {
      logger.error('Error refrescando token:', error.message || error);
      return ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
    }

    try {
      const result = await AuthService.logout(userId);

      if (result.success) {
        // Limpiar refresh token cookie
        res.clearCookie('refreshToken', {
          path: '/api/v1/auth/refresh'
        });

        return ResponseHelper.success(res, null, 'Logout exitoso');
      }

      return ResponseHelper.internalError(res, result.error || 'Error en logout');
    } catch (error: any) {
      logger.error('Error en logout controller:', error.message || error);
      return ResponseHelper.internalError(res, 'Error interno del servidor');
    }
  });

  /**
   * Verify token - endpoint para verificar si el token es válido
   * GET /api/v1/auth/verify
   */
  static verifyToken = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    // Si llegamos aquí, el middleware de auth ya validó el token
    const user = req.user;

    if (!user) {
      return ResponseHelper.unauthorized(res, 'Token inválido');
    }

    return ResponseHelper.success(res, { 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.rol?.clave || 'user'
      }
    }, 'Token válido');
  });

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
    }

    // TODO: Implement changePassword method in AuthService
    return ResponseHelper.badRequest(res, 'Cambio de contraseña no implementado aún');
  });

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
    }

    return ResponseHelper.success(res, user, 'Perfil obtenido exitosamente');
  });
}
