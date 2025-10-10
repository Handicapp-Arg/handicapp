import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { LoginData, AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import { config } from '../config/config';
import { clearUserLoginAttempts } from '../middleware/security';

export class AuthController {
  
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { nombre, apellido, email, password, telefono } = req.body || {};

    if (!nombre || !apellido || !email || !password) {
      return ResponseHelper.badRequest(res, 'Faltan campos requeridos', [
        'nombre, apellido, email y password son requeridos'
      ]);
    }

    const result = await AuthService.register({ nombre, apellido, email, password, telefono });
    if (!result.success) {
      const message = result.error || 'Error en registro';
      if (message.toLowerCase().includes('email')) {
        return ResponseHelper.badRequest(res, message);
      }
      return ResponseHelper.internalError(res, message);
    }

    return ResponseHelper.created(res, result.data, 'Registro exitoso');
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData: LoginData = {
      email: (req.body?.email || '').trim().toLowerCase(),
      password: req.body?.password
    };

    // Validación básica
    if (!loginData.email || !loginData.password) {
      return ResponseHelper.badRequest(res, 'Email y contraseña son requeridos');
    }

    try {
      const result = await AuthService.login(loginData);

      if (result.success && result.data) {
        // Login exitoso - limpiar intentos fallidos del usuario
        clearUserLoginAttempts(loginData.email);

        // Configurar access token como httpOnly cookie
        res.cookie('auth-token', result.data.accessToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
          maxAge: 60 * 60 * 1000, // 1 hora
          path: '/'
        });

        // Configurar refresh token como httpOnly cookie
        res.cookie('refresh-token', result.data.refreshToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
          path: '/'
        });

        // Retornar datos del usuario (sin tokens expuestos)
        const responseData = {
          user: result.data.user,
          token: result.data.accessToken, // compat legacy
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          expiresIn: result.data.expiresIn
        };

        return ResponseHelper.success(res, responseData, result.message);
      }

  return ResponseHelper.badRequest(res, result.message || result.error || 'Login failed');
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
    const refreshToken = req.cookies['refresh-token'] || req.body.refreshToken;

    if (!refreshToken) {
      return ResponseHelper.unauthorized(res, 'Refresh token requerido');
    }

    try {
      const result = await AuthService.refreshToken(refreshToken);

      if (result.success && result.data) {
        // Configurar nuevo access token como httpOnly cookie
        res.cookie('auth-token', result.data.accessToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
          maxAge: 60 * 60 * 1000, // 1 hora
          path: '/'
        });

        // Configurar nuevo refresh token como httpOnly cookie (rotación)
        res.cookie('refresh-token', result.data.refreshToken, {
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
          path: '/'
        });

        const responseData = {
          success: true,
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
        // Limpiar cookies de autenticación
        res.clearCookie('auth-token', { path: '/' });
        res.clearCookie('refresh-token', { path: '/' });

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
   * Verify email via token
   * POST /api/v1/auth/verify-email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body || {};
    if (!token) return ResponseHelper.badRequest(res, 'Token requerido');
    const result = await AuthService.verifyEmail(token);
    if (!result.success) return ResponseHelper.badRequest(res, result.error || 'Token inválido');
    return ResponseHelper.success(res, null, result.message || 'Cuenta verificada');
  });

  /**
   * Send password reset email
   * POST /api/v1/auth/send-reset
   */
  static sendReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body || {};
    if (!email) return ResponseHelper.badRequest(res, 'Email requerido');
    const result = await AuthService.sendPasswordReset(email);
    if (!result.success) return ResponseHelper.internalError(res, result.error || 'Error enviando email');
    return ResponseHelper.success(res, null, result.message || 'Si el email existe, enviaremos instrucciones.');
  });

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return ResponseHelper.badRequest(res, 'Token y nueva contraseña requeridos');
    const result = await AuthService.resetPassword(token, newPassword);
    if (!result.success) return ResponseHelper.badRequest(res, result.error || 'Token inválido');
    return ResponseHelper.success(res, null, result.message || 'Contraseña actualizada');
  });

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   */
  static resendVerification = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body || {};
    if (!email) return ResponseHelper.badRequest(res, 'Email requerido');
    const result = await AuthService.resendVerification(email);
    if (!result.success) return ResponseHelper.internalError(res, result.error || 'Error reenviando verificación');
    return ResponseHelper.success(res, null, result.message || 'Si el email existe, enviaremos el enlace.');
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
