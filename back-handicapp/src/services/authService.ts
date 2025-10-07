import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { ServiceResponse } from '../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: number;
      email: string;
      nombre: string;
      apellido: string;
      rol: {
        id: number;
        nombre: string;
        clave: string;
      };
      verificado: boolean;
      estado_usuario: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  error?: string;
}

// Store de refresh tokens en memoria (en producción usar Redis)
const refreshTokenStore = new Map<number, string>();

export class AuthService {
  
  /**
   * Generar access token
   */
  static generateAccessToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.rol?.clave || 'user'
    };

    return (jwt as any).sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }
  
  /**
   * Generar refresh token
   */
  static generateRefreshToken(userId: number): string {
    const payload = {
      userId,
      type: 'refresh'
    };
    
    const refreshToken = (jwt as any).sign(
      payload, 
      config.jwt.refreshSecret || config.jwt.secret, 
      { expiresIn: config.jwt.refreshExpiresIn }
    );
    
    refreshTokenStore.set(userId, refreshToken);
    return refreshToken;
  }
  
  /**
   * Login con email y password
   */
  static async login(loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const { email, password } = loginData;

      // Buscar usuario con rol y contraseña
      const user = await User.scope('withSecret').findOne({
        where: { email },
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }]
      });

      if (!user) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Verificar estado del usuario
      if (!user.isActive) {
        return {
          success: false,
          message: 'Usuario inactivo'
        };
      }

      // Verificar password usando el método del modelo
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }

      // Generar tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user.id);

      // Preparar respuesta
      const userData = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: {
          id: user.rol?.id || 0,
          nombre: user.rol?.nombre || 'Usuario',
          clave: user.rol?.clave || 'user'
        },
        verificado: user.verificado,
        estado_usuario: String(user.estado_usuario)
      };

      logger.info(`Usuario ${user.email} autenticado correctamente`);

      return {
        success: true,
        message: 'Login exitoso',
        data: {
          user: userData,
          accessToken,
          refreshToken,
          expiresIn: 15 * 60 // 15 minutos en segundos
        }
      };

    } catch (error) {
      logger.error(`Error en login: ${String(error)}`);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Refrescar access token
   */
  static async refreshToken(refreshToken: string): Promise<any> {
    try {
      // Verificar refresh token
      const decoded = (jwt as any).verify(
        refreshToken, 
        config.jwt.refreshSecret || config.jwt.secret
      );
      
      const userId = decoded.userId;
      
      // Verificar si el token existe en el store
      const storedToken = refreshTokenStore.get(userId);
      if (!storedToken || storedToken !== refreshToken) {
        return {
          success: false,
          error: 'Refresh token inválido'
        };
      }

      // Buscar usuario
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['id', 'nombre', 'clave']
        }]
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          error: 'Usuario no encontrado o inactivo'
        };
      }

      // Generar nuevos tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user.id);

      return {
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: 15 * 60
        }
      };

    } catch (error) {
      logger.error(`Error en refresh token: ${String(error)}`);
      return {
        success: false,
        error: 'Error interno del servidor'
      };
    }
  }

  /**
   * Logout
   */
  static async logout(userId: number): Promise<ServiceResponse<void>> {
    try {
      refreshTokenStore.delete(userId);
      logger.info(`Usuario ${userId} deslogueado`);
      
      return {
        success: true,
        message: 'Logout exitoso'
      };
    } catch (error) {
      logger.error(`Error en logout: ${String(error)}`);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Verificar access token
   */
  static verifyAccessToken(token: string): { valid: boolean; payload?: any } {
    try {
      const payload = (jwt as any).verify(token, config.jwt.secret);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
  }
}

export default AuthService;