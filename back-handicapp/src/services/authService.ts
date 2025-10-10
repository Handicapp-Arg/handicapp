import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { ServiceResponse } from '../types';
import { EstadoUsuario } from '../models/enums';
import { sendEmail, renderBrandedEmail } from './emailService';
import bcrypt from 'bcrypt';

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
   * Registro de usuario público (rol: propietario por defecto)
   */
  static async register(data: {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono?: string;
  }): Promise<ServiceResponse<{ user: any }>> {
    try {
      const { nombre, apellido, email, password, telefono } = data;

      // Verificar si el email ya existe
      const existing = await User.scope('withSecret').findOne({ where: { email: email.trim().toLowerCase() } });
      if (existing) {
        return { success: false, error: 'Email ya registrado' };
      }

      // Determinar rol propietario por clave
      const role = await Role.findOne({ where: { clave: 'propietario' } });
      if (!role) {
        return { success: false, error: 'Rol por defecto no disponible' };
      }

      // Crear usuario
      const user = User.build({
        email: email.trim().toLowerCase(),
        rol_id: role.id,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono?.trim() || null,
  verificado: false,
  estado_usuario: EstadoUsuario.pending,
      });

  // Hashear contraseña de forma defensiva (además del hook)
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(String(password).trim(), salt);
  user.set('hash_contrasena', hash);
  await user.save();

      // Compose response user object (sin secretos)
      const safeUser = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        verificado: user.verificado,
        estado_usuario: String(user.estado_usuario),
        rol: role ? { id: role.id, nombre: role.nombre, clave: role.clave } : undefined,
      };

      // Enviar email de verificación (token corto vía JWT)
      const verifyToken = (jwt as any).sign(
        { type: 'verify', userId: user.id },
        config.jwt.secret,
        { expiresIn: '24h' }
      );
      const verifyUrl = `${config.app.webUrl}/verify?token=${encodeURIComponent(verifyToken)}`;
      const html = renderBrandedEmail({
        title: 'Verificá tu cuenta',
        intro: `Hola ${user.nombre}, gracias por registrarte en HandicApp. Por favor verificá tu correo para activar tu cuenta.`,
        actionText: 'Verificá mi cuenta',
        actionUrl: verifyUrl,
        footer: 'Equipo HandicApp',
      });
      try {
        await sendEmail({ to: user.email, subject: 'Verifica tu cuenta - HandicApp', html });
      } catch (err: any) {
        logger.warn('Fallo enviando email de verificación (register)', {
          email: user.email,
          error: err?.message || String(err)
        });
      }

      logger.info(`Usuario registrado: ${user.email}`);
      return { success: true, data: { user: safeUser }, message: 'Registro exitoso. Revisa tu email para verificar la cuenta.' };
    } catch (error: any) {
      const msg = error?.name === 'SequelizeUniqueConstraintError' ? 'Email ya registrado' : 'Error interno del servidor';
      logger.error(`Error en register: ${String(error)}`);
      return { success: false, error: msg };
    }
  }

  /** Crear token de restablecimiento y mandar email */
  static async sendPasswordReset(email: string): Promise<ServiceResponse<{}>> {
    try {
      const user = await User.scope('withSecret').findOne({ where: { email: email.trim().toLowerCase() } });
      if (!user) return { success: true, data: {}, message: 'Si el email existe, enviaremos instrucciones.' };
      const resetToken = (jwt as any).sign(
        { type: 'reset', userId: user.id },
        config.jwt.secret,
        { expiresIn: '1h' }
      );
      const resetUrl = `${config.app.webUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
      const html = renderBrandedEmail({
        title: 'Restablecer contraseña',
        intro: `Hola ${user.nombre}, recibimos una solicitud para restablecer tu contraseña.`,
        actionText: 'Restablecer contraseña',
        actionUrl: resetUrl,
        footer: 'Si no fuiste vos, ignora este correo.',
      });
      try {
        await sendEmail({ to: user.email, subject: 'Restablecer contraseña - HandicApp', html });
      } catch (err: any) {
        logger.warn('Fallo enviando email de reset password', {
          email: user.email,
          error: err?.message || String(err)
        });
      }
      return { success: true, data: {}, message: 'Si el email existe, enviaremos instrucciones.' };
    } catch (error) {
      logger.error('Error enviando reset password:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /** Verificar email a partir de token */
  static async verifyEmail(token: string): Promise<ServiceResponse<{}>> {
    try {
      const payload = (jwt as any).verify(token, config.jwt.secret);
      if (payload?.type !== 'verify' || !payload?.userId) return { success: false, error: 'Token inválido' };
      const user = await User.findByPk(payload.userId);
      if (!user) return { success: false, error: 'Usuario no encontrado' };
      user.verificado = true;
      user.estado_usuario = EstadoUsuario.active;
      await user.save();
      return { success: true, data: {}, message: 'Cuenta verificada' };
    } catch (error) {
      logger.warn('Fallo verificación de email:', error);
      return { success: false, error: 'Token inválido o expirado' };
    }
  }

  /** Reenviar verificación a un email */
  static async resendVerification(email: string): Promise<ServiceResponse<{}>> {
    try {
      const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });
      // Siempre devolvemos éxito para no filtrar existencia de emails
      if (!user) return { success: true, data: {}, message: 'Si el email existe, enviaremos el enlace.' };
      if (user.verificado) return { success: true, data: {}, message: 'La cuenta ya está verificada.' };

      const verifyToken = (jwt as any).sign(
        { type: 'verify', userId: user.id },
        config.jwt.secret,
        { expiresIn: '24h' }
      );
      const verifyUrl = `${config.app.webUrl}/verify?token=${encodeURIComponent(verifyToken)}`;
      const html = renderBrandedEmail({
        title: 'Verificá tu cuenta',
        intro: `Hola ${user.nombre || ''}, por favor verificá tu correo para activar tu cuenta.`,
        actionText: 'Verificá mi cuenta',
        actionUrl: verifyUrl,
        footer: 'Equipo HandicApp',
      });
      try {
        await sendEmail({ to: user.email, subject: 'Verifica tu cuenta - HandicApp', html });
      } catch (err: any) {
        logger.warn('Fallo reenviando email de verificación', {
          email: user.email,
          error: err?.message || String(err)
        });
      }
      return { success: true, data: {}, message: 'Si el email existe, enviaremos el enlace.' };
    } catch (error) {
      logger.error('Error reenviando verificación:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /** Aplicar cambio de contraseña con token de reset */
  static async resetPassword(token: string, newPassword: string): Promise<ServiceResponse<{}>> {
    try {
      const payload = (jwt as any).verify(token, config.jwt.secret);
      if (payload?.type !== 'reset' || !payload?.userId) return { success: false, error: 'Token inválido' };
      const user = await User.scope('withSecret').findByPk(payload.userId);
      if (!user) return { success: false, error: 'Usuario no encontrado' };
      (user as any).setPassword(newPassword);
      await user.save();
      return { success: true, data: {}, message: 'Contraseña actualizada' };
    } catch (error) {
      logger.warn('Fallo reset password:', error);
      return { success: false, error: 'Token inválido o expirado' };
    }
  }
  
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
      const { password } = loginData;
      const email = loginData.email.trim().toLowerCase();

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

      // Verificar verificación/estado del usuario
      if (!user.verificado) {
        return {
          success: false,
          message: 'Cuenta no verificada. Revisá tu correo para activarla.'
        };
      }
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