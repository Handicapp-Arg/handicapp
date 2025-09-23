import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/config';
import { JwtPayload, CreateUserData, LoginData, ServiceResponse } from '../types';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/errors';
import { DatabaseService } from './databaseService';
import { logger } from '../utils/logger';

export class AuthService {
  // Generate JWT tokens
  static generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
    } as jwt.SignOptions);

    return { accessToken, refreshToken };
  }

  // Verify JWT token
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  // Register new user
  static async register(userData: CreateUserData): Promise<ServiceResponse<{ user: User; tokens: any }>> {
    return DatabaseService.executeInTransaction(async (transaction) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({
          where: { email: userData.email },
          paranoid: false, // Include soft-deleted users
          transaction,
        });

        if (existingUser) {
          throw new ConflictError('User with this email already exists');
        }

        // Create new user with password (the hook will handle hashing)
        const user = await User.create({
          email: userData.email,
          nombre: userData.firstName,
          apellido: userData.lastName,
          rol_id: 1, // Rol por defecto (usuario normal)
          hash_contrasena: userData.password, // El hook beforeCreate lo hasheará
        }, { transaction });

        // Generate tokens
        const tokens = this.generateTokens(user);

        // Update last login
        await user.update({ ultimo_acceso_el: new Date() }, { transaction });

        logger.info('Usuario registrado exitosamente', {
          userId: user.id,
          email: user.email,
        });

        return {
          success: true,
          data: {
            user: user.toJSON() as User,
            tokens,
          },
        };
      } catch (error) {
        logger.error('Error en registro de usuario:', error);
        if (error instanceof ConflictError || error instanceof ValidationError) {
          throw error;
        }
        throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  // Login user
  static async login(loginData: LoginData): Promise<ServiceResponse<{ user: User; tokens: any }>> {
    try {
      // Find user by email
      const user = await User.findOne({
        where: { email: loginData.email },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AuthenticationError('Account is deactivated');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(loginData.password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Update last login
      await user.update({ ultimo_acceso_el: new Date() });

      return {
        success: true,
        data: {
          user: user.toJSON() as User,
          tokens,
        },
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<ServiceResponse<{ tokens: any }>> {
    try {
      // Verify refresh token
      const payload = this.verifyToken(refreshToken);

      // Find user
      const user = await User.findByPk(payload.userId);
      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      return {
        success: true,
        data: { tokens },
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new Error('Token refresh failed');
    }
  }

  // Logout (in a real app, you might want to blacklist the token)
  static async logout(_userId: string): Promise<ServiceResponse<null>> {
    try {
      // In a production app, you would add the token to a blacklist
      // For now, we'll just return success
      return {
        success: true,
        data: null,
      };
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  // Change password
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Validate current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      await user.update({ password: newPassword });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new Error('Password change failed');
    }
  }
}
