import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { LoginData } from '../types';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
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


}
