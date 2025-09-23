import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { CreateUserData, LoginData } from '../types';

export class AuthController {
  // Register new user
  static register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userData: CreateUserData = req.body;
    console.log('Register endpoint hit');
    const result = await AuthService.register(userData);

    if (result.success) {
      return ResponseHelper.created(res, result.data, 'User registered successfully');
    }

    return ResponseHelper.badRequest(res, result.error || 'Registration failed');
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const loginData: LoginData = req.body;

    const result = await AuthService.login(loginData);

    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Login successful');
    }

    return ResponseHelper.badRequest(res, result.error || 'Login failed');
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ResponseHelper.badRequest(res, 'Refresh token is required');
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Token refreshed successfully');
    }

    return ResponseHelper.badRequest(res, result.error || 'Token refresh failed');
  });

  // Logout user
  static logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    const result = await AuthService.logout(userId);

    if (result.success) {
      return ResponseHelper.success(res, null, 'Logout successful');
    }

    return ResponseHelper.internalError(res, result.error || 'Logout failed');
  });

  // Change password
  static changePassword = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return ResponseHelper.unauthorized(res, 'User not authenticated');
    }

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    if (result.success) {
      return ResponseHelper.success(res, null, 'Password changed successfully');
    }

    return ResponseHelper.badRequest(res, result.error || 'Password change failed');
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
