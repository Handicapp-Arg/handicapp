import { Request, Response, NextFunction } from 'express';
import { AuthController } from './authController';
import { UserService } from '../services/userService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { UpdateUserData, PaginationQuery } from '../types';

export class UserController {
  // Get all users
  static getUsers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const pagination: PaginationQuery = {
      page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
      limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
      sortBy: req.query['sortBy'] as string,
      sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC',
    };
    
    const result = await UserService.getUsers(pagination);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Users retrieved successfully', 200, {
        page: pagination.page,
        limit: pagination.limit,
        total: result.data?.total,
        totalPages: result.data?.totalPages,
      });
    }
    
    return ResponseHelper.internalError(res, result.error || 'Failed to fetch users');
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
    
    const pagination: PaginationQuery = {
      page: req.query['page'] ? parseInt(req.query['page'] as string) : 1,
      limit: req.query['limit'] ? parseInt(req.query['limit'] as string) : 10,
      sortBy: req.query['sortBy'] as string,
      sortOrder: req.query['sortOrder'] as 'ASC' | 'DESC',
    };
    
    const result = await UserService.searchUsers(q, pagination);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Search completed successfully', 200, {
        page: pagination.page,
        limit: pagination.limit,
        total: result.data?.total,
        totalPages: result.data?.totalPages,
      });
    }
    
    return ResponseHelper.internalError(res, result.error || 'Search failed');
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
    
    const result = await UserService.updateUser(userId, updateData);
    
    if (result.success) {
      return ResponseHelper.success(res, result.data, 'Profile updated successfully');
    }
    
    return ResponseHelper.badRequest(res, result.error || 'Failed to update profile');
  });

  // Get current user profile (re-export from auth controller)
  static getProfile = AuthController.getProfile;
}