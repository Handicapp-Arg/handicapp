import { Op } from 'sequelize';
import { User } from '../models/User';
import { UpdateUserData, PaginationQuery, ServiceResponse } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';

export class UserService {
  // Get all users with pagination
  static async getUsers(
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ users: User[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        paranoid: true, // Exclude soft-deleted users
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          users: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<ServiceResponse<User>> {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch user');
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<ServiceResponse<User>> {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch user');
    }
  }

  // Update user
  static async updateUser(
    userId: string,
    updateData: UpdateUserData
  ): Promise<ServiceResponse<User>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if email is being updated and if it's already taken
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: updateData.email },
          paranoid: false,
        });

        if (existingUser && existingUser.id !== userId) {
          throw new ConflictError('Email is already taken');
        }
      }

      await user.update(updateData as any);

      return {
        success: true,
        data: user.toJSON() as User,
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to update user');
    }
  }

  // Delete user (soft delete)
  static async deleteUser(userId: string): Promise<ServiceResponse<null>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.destroy();

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to delete user');
    }
  }

  // Activate/Deactivate user
  static async toggleUserStatus(userId: string): Promise<ServiceResponse<User>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.update({ isActive: !user.isActive });

      return {
        success: true,
        data: user.toJSON() as User,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to toggle user status');
    }
  }

  // Search users
  static async searchUsers(
    query: string,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ users: User[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${query}%` } },
            { lastName: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
          ],
        },
        attributes: { exclude: ['password'] },
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        paranoid: true,
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          users: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      throw new Error('Failed to search users');
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<ServiceResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
  }>> {
    try {
      const totalUsers = await User.count({ paranoid: true });
      const activeUsers = await User.count({
        where: { isActive: true },
        paranoid: true,
      });
      const inactiveUsers = totalUsers - activeUsers;

      // Get users by role
      const usersByRole = await User.findAll({
        attributes: [
          'role',
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
        ],
        group: ['role'],
        paranoid: true,
        raw: true,
      });

      const roleStats = usersByRole.reduce((acc: Record<string, number>, item: any) => {
        acc[item.role] = parseInt(item.count);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          usersByRole: roleStats,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }
}
