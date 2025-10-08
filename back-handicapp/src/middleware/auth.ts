import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { JwtPayload, AuthenticatedRequest } from '../types';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { AuthService } from '../services/authService';

/**
 * Middleware principal de autenticación
 * Verifica el token JWT y carga la información del usuario
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Intentar obtener token de cookie httpOnly primero, luego del header Authorization
    let token = req.cookies['auth-token'];
    
    // Fallback: buscar en Authorization header (para compatibilidad con clientes que usen Bearer)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        code: 'MISSING_TOKEN'
      });
      return;
    }
    
    // Validar token usando AuthService
    const validation = AuthService.verifyAccessToken(token);
    
    if (!validation.valid || !validation.payload) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    // Find user in database
    const user = await User.findByPk(validation.payload.userId, {
      attributes: { exclude: ['hash_contrasena'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['id', 'nombre', 'clave']
      }]
    });
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Cuenta de usuario desactivada',
        code: 'USER_INACTIVE'
      });
      return;
    }
    
    // Attach user to request
    req.user = {
      id: Number(user.id),
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono ? String(user.telefono) : undefined,
      activo: user.isActive,
      rol: user.rol ? {
        id: Number(user.rol.id),
        clave: user.rol.clave,
        nombre: user.rol.nombre
      } : undefined,
      creado_el: user.creado_el as Date,
      actualizado_el: (user.actualizado_el || new Date()) as Date
    };
    
    next();
  } catch (error) {
    logger.error('Error en autenticación: ' + String(error));
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  }
};

/**
 * Middleware de autorización por roles específicos
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    const userRole = req.user.rol?.clave;
    
    if (!userRole) {
      res.status(403).json({
        success: false,
        message: 'Usuario sin rol asignado'
      });
      return;
    }
    
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        message: 'No tiene permisos para acceder a este recurso'
      });
      return;
    }
    
    next();
  };
};

/**
 * Middleware de autenticación opcional
 * No falla si no hay token, pero carga el usuario si está disponible
 */
export const optionalAuth = async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }
    
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['hash_contrasena'] },
      include: [{
        model: Role,
        as: 'rol',
        attributes: ['id', 'nombre', 'clave']
      }]
    });
    
    if (user && user.isActive) {
      req.user = {
        id: Number(user.id),
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono ? String(user.telefono) : undefined,
        activo: user.isActive,
        rol: user.rol ? {
          id: Number(user.rol.id),
          clave: user.rol.clave,
          nombre: user.rol.nombre
        } : undefined,
        creado_el: user.creado_el as Date,
        actualizado_el: (user.actualizado_el || new Date()) as Date
      };
    }
    
    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};

/**
 * Middleware solo para administradores
 */
export const adminOnly = requireRole('admin');

/**
 * Middleware para usuarios autorizados o administradores
 */
export const userOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Autenticación requerida'
    });
    return;
  }
  
  const userRole = req.user.rol?.clave;
  const isAdmin = userRole === 'admin';
  
  // Admin siempre puede
  if (isAdmin) {
    next();
    return;
  }
  
  // Verificar si es su propio perfil
  const requestedUserId = req.params['id'];
  if (requestedUserId && req.user.id === parseInt(requestedUserId)) {
    next();
    return;
  }
  
  res.status(403).json({
    success: false,
    message: 'Permisos insuficientes'
  });
};

// Re-export from security middleware
export { authRateLimiter } from './security';
