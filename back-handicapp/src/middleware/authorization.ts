// src/middleware/authorization.ts
// -----------------------------------------------------------------------------
// HandicApp API - Middleware de Autorización
// -----------------------------------------------------------------------------

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

/**
 * Tipos de roles disponibles en el sistema
 */
export type UserRole = 'admin' | 'establecimiento' | 'propietario' | 'veterinario' | 'capataz' | 'empleado';

/**
 * Tipos de permisos granulares
 */
export type Permission = 
  // Gestión de usuarios
  | 'users:read' | 'users:write' | 'users:delete'
  // Gestión de establecimientos
  | 'establishments:read' | 'establishments:write' | 'establishments:delete'
  | 'establishments:manage_users' | 'establishments:view_stats'
  // Gestión de caballos
  | 'horses:read' | 'horses:write' | 'horses:delete'
  | 'horses:manage_owners' | 'horses:view_medical' | 'horses:edit_medical'
  // Gestión de eventos
  | 'events:read' | 'events:write' | 'events:delete'
  | 'events:create_medical' | 'events:view_reports'
  // Gestión de tareas
  | 'tasks:read' | 'tasks:write' | 'tasks:delete'
  | 'tasks:assign' | 'tasks:complete' | 'tasks:view_all'
  // Permisos administrativos
  | 'admin:full_access' | 'admin:view_audit' | 'admin:manage_roles';

/**
 * Matriz de permisos por rol
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Acceso completo a todo
    'admin:full_access',
    'admin:view_audit',
    'admin:manage_roles',
    'users:read', 'users:write', 'users:delete',
    'establishments:read', 'establishments:write', 'establishments:delete',
    'establishments:manage_users', 'establishments:view_stats',
    'horses:read', 'horses:write', 'horses:delete',
    'horses:manage_owners', 'horses:view_medical', 'horses:edit_medical',
    'events:read', 'events:write', 'events:delete',
    'events:create_medical', 'events:view_reports',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'tasks:assign', 'tasks:complete', 'tasks:view_all'
  ],
  
  establecimiento: [
    // Gestión de su establecimiento
    'users:read',
    'establishments:read', 'establishments:write',
    'establishments:manage_users', 'establishments:view_stats',
    'horses:read', 'horses:write',
    'horses:manage_owners', 'horses:view_medical',
    'events:read', 'events:write',
    'events:view_reports',
    'tasks:read', 'tasks:write',
    'tasks:assign', 'tasks:view_all'
  ],
  
  propietario: [
    // Gestión de sus caballos
    'users:read',
    'establishments:read',
    'horses:read', 'horses:write',
    'horses:manage_owners', 'horses:view_medical',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write'
  ],
  
  veterinario: [
    // Gestión médica completa
    'users:read',
    'establishments:read',
    'horses:read', 'horses:write',
    'horses:view_medical', 'horses:edit_medical',
    'events:read', 'events:write', 'events:delete',
    'events:create_medical',
    'tasks:read', 'tasks:write',
    'tasks:complete'
  ],
  
  capataz: [
    // Gestión operativa del establecimiento
    'users:read',
    'establishments:read',
    'horses:read', 'horses:write',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'tasks:assign', 'tasks:complete', 'tasks:view_all'
  ],
  
  empleado: [
    // Operaciones básicas
    'establishments:read',
    'horses:read',
    'events:read',
    'tasks:read', 'tasks:complete'
  ]
};

/**
 * Middleware para verificar si el usuario tiene uno de los roles especificados
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json(ApiResponse.error('Usuario no autenticado'));
        return;
      }

      const userRole = req.user.rol?.clave as UserRole;

      // Verificar que el usuario tenga un rol válido
      if (!userRole) {
        logger.warn('Usuario sin rol asignado', { userId: req.user.id });
        res.status(403).json(ApiResponse.error('Usuario sin rol asignado'));
        return;
      }

      // Verificar que el rol esté en la lista de roles permitidos
      if (!allowedRoles.includes(userRole)) {
        logger.warn('Acceso denegado por rol', { 
          userId: req.user.id, 
          userRole, 
          allowedRoles,
          path: req.path,
          method: req.method
        });
        res.status(403).json(ApiResponse.error('No tiene permisos para acceder a este recurso'));
        return;
      }

      // Admin siempre tiene acceso
      if (userRole === 'admin') {
        next();
        return;
      }

      next();
    } catch (error) {
      logger.error('Error en middleware requireRole:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  };
}

/**
 * Middleware para verificar permisos granulares
 */
export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        res.status(401).json(ApiResponse.error('Usuario no autenticado'));
        return;
      }

      const userRole = req.user.rol?.clave as UserRole;

      // Verificar que el usuario tenga un rol válido
      if (!userRole) {
        logger.warn('Usuario sin rol asignado', { userId: req.user.id });
        res.status(403).json(ApiResponse.error('Usuario sin rol asignado'));
        return;
      }

      // Obtener permisos del rol del usuario
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      // Admin siempre tiene acceso
      if (userRole === 'admin' || userPermissions.includes('admin:full_access')) {
        next();
        return;
      }

      // Verificar que el usuario tenga al menos uno de los permisos requeridos
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn('Acceso denegado por permisos', { 
          userId: req.user.id, 
          userRole, 
          userPermissions,
          requiredPermissions,
          path: req.path,
          method: req.method
        });
        res.status(403).json(ApiResponse.error('No tiene permisos para realizar esta acción'));
        return;
      }

      next();
    } catch (error) {
      logger.error('Error en middleware requirePermission:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  };
}

/**
 * Middleware para verificar propiedad de recursos
 * Verifica si el usuario puede acceder a un recurso específico basado en propiedad/membresía
 */
export function requireResourceAccess(resourceType: 'establecimiento' | 'caballo' | 'evento' | 'tarea') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.rol?.clave as UserRole;
      const userId = req.user?.id;

      // Admin siempre tiene acceso
      if (userRole === 'admin') {
        next();
        return;
      }

      // Obtener ID del recurso desde los parámetros
      const resourceId = parseInt(req.params.id);

      if (isNaN(resourceId)) {
        res.status(400).json(ApiResponse.error('ID de recurso inválido'));
        return;
      }

      // Aquí se implementaría la lógica específica de verificación de acceso
      // Por ahora, permitir acceso si el usuario está autenticado
      // TODO: Implementar verificación específica de propiedad/membresía

      next();
    } catch (error) {
      logger.error('Error en middleware requireResourceAccess:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  };
}

/**
 * Middleware para limitar acceso a usuarios del mismo establecimiento
 */
export function requireSameEstablishment() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = req.user?.rol?.clave as UserRole;

      // Admin siempre tiene acceso
      if (userRole === 'admin') {
        next();
        return;
      }

      // Para otros roles, verificar membresía del establecimiento
      // TODO: Implementar verificación de membresía
      
      next();
    } catch (error) {
      logger.error('Error en middleware requireSameEstablishment:', error);
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  };
}

/**
 * Utility function para verificar si un usuario tiene un permiso específico
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return userRole === 'admin' || rolePermissions.includes(permission) || rolePermissions.includes('admin:full_access');
}

/**
 * Utility function para obtener todos los permisos de un rol
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Middleware para logs de auditoría de acceso
 */
export function auditAccess() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.id;
    const userRole = req.user?.rol?.clave;
    const method = req.method;
    const path = req.path;
    const ip = req.ip;

    logger.info('API Access', {
      userId,
      userRole,
      method,
      path,
      ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    next();
  };
}