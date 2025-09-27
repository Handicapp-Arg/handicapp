import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { JwtPayload } from '../types';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { config } from '../config/config';

// Extend Request interface for authenticated requests
interface AuthRequest extends Request {
  user?: User;
}

// JWT token verification middleware
export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Access token is required');
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('Access token is required');
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    
    // Find user in database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['hash_contrasena'] },
    });
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    if (!user.isActive) {
      throw new AuthenticationError('User account is deactivated');
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    if (!roles.includes(req.user.rol?.clave || '')) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    
    next();
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['hash_contrasena'] },
    });
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Ignore JWT errors for optional auth
    next();
  }
};

// Admin only middleware
export const adminOnly = authorize('admin');

// User or admin middleware (permite admin + otros roles)
export const userOrAdmin = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }
  
  const userRole = req.user.rol?.clave;
  const isAdmin = userRole === 'admin';
  
  // Admin siempre puede, otros usuarios solo pueden acceder a su propia información
  if (isAdmin) {
    return next();
  }
  
  // Verificar si es su propio perfil (si hay parámetro id)
  const requestedUserId = req.params['id'];
  if (requestedUserId && req.user.id === parseInt(requestedUserId)) {
    return next();
  }
  
  // Si no es admin ni su propio perfil, denegar acceso
  return next(new AuthorizationError('Insufficient permissions'));
};

// Moderator or admin middleware
export const moderatorOrAdmin = authorize('moderator', 'admin');

// Re-export authRateLimiter from security middleware
export { authRateLimiter } from './security';
