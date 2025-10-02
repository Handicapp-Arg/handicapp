import { Op } from 'sequelize';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { UpdateUserData, PaginationQuery, ServiceResponse } from '../types';
import { NotFoundError, ConflictError } from '../utils/errors';

export class UserService {
  // Get all users with pagination
  static async getUsers(
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ users: User[]; total: number; totalPages: number }>> {
    try {
      console.log('🔍 UserService.getUsers called with:', pagination);
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_creacion', // Corregido: usar el nombre real del campo
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;
      
      console.log('📊 Query parameters:', { page, limit, sortBy, sortOrder, offset });

      const { count, rows } = await User.findAndCountAll({
        attributes: { exclude: ['hash_contrasena'] },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      console.log('✅ Query result:', { count, usersFound: rows.length });

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
      console.error('❌ Error in UserService.getUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<ServiceResponse<User>> {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['hash_contrasena'] },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }]
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
        attributes: { exclude: ['hash_contrasena'] },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }]
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

        if (existingUser && existingUser.id.toString() !== userId) {
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

      const newStatus = user.estado_usuario === 'active' ? 'inactive' : 'active';
      await user.update({ estado_usuario: newStatus });

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
      console.log('🔍 UserService.searchUsers called with:', { query, pagination });
      
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_creacion', // Corregido: usar el nombre real del campo
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      console.log('📊 Search parameters:', { query, page, limit, sortBy, sortOrder, offset });

      const { count, rows } = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${query}%` } },
            { apellido: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
          ],
        },
        attributes: { exclude: ['hash_contrasena'] },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      console.log('✅ Search result:', { count, usersFound: rows.length });

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
      console.error('❌ Error in UserService.searchUsers:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<ServiceResponse<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    verifiedUsers: number;
    recentUsers: number;
    roleDistribution: Record<string, number>;
  }>> {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({
        where: { estado_usuario: 'active' }
      });
      const inactiveUsers = totalUsers - activeUsers;
      const verifiedUsers = await User.count({
        where: { verificado: true }
      });

      // Usuarios creados en los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUsers = await User.count({
        where: {
          creado_el: {
            [Op.gte]: sevenDaysAgo
          }
        }
      });

      // Get users by role
      const usersByRole = await User.findAll({
        attributes: [
          [User.sequelize!.col('rol.clave'), 'role_key'],
          [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count'],
        ],
        include: [{
          model: Role,
          as: 'rol',
          attributes: []
        }],
        group: ['rol.clave'],
        raw: true,
      });

      const roleDistribution = usersByRole.reduce((acc: Record<string, number>, item: any) => {
        acc[item.role_key] = parseInt(item.count);
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          verifiedUsers,
          recentUsers,
          roleDistribution,
        },
      };
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }
}
