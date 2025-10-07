'use client';

import { useAuthNew } from './useAuthNew';

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

export type UserRole = 'admin' | 'establecimiento' | 'propietario' | 'veterinario' | 'capataz' | 'empleado';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
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
    'users:read',
    'establishments:read',
    'horses:read', 'horses:write',
    'horses:manage_owners', 'horses:view_medical',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write'
  ],
  
  veterinario: [
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
    'users:read',
    'establishments:read',
    'horses:read', 'horses:write',
    'events:read', 'events:write',
    'tasks:read', 'tasks:write', 'tasks:delete',
    'tasks:assign', 'tasks:complete', 'tasks:view_all'
  ],
  
  empleado: [
    'establishments:read',
    'horses:read',
    'events:read',
    'tasks:read', 'tasks:complete'
  ]
};

/**
 * Hook para verificar permisos del usuario actual
 */
export function usePermissions() {
  const { user } = useAuthNew();

  const hasPermission = (permission: Permission): boolean => {
    if (!user?.rol?.clave) return false;
    
    const userRole = user.rol.clave as UserRole;
    
    // Admin siempre tiene acceso
    if (userRole === 'admin') return true;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes('admin:full_access');
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const canCreateEvents = (): boolean => {
    return hasPermission('events:write');
  };

  const canCreateMedicalEvents = (): boolean => {
    return hasPermission('events:create_medical');
  };

  const canDeleteEvents = (): boolean => {
    return hasPermission('events:delete');
  };

  const canCreateTasks = (): boolean => {
    return hasPermission('tasks:write');
  };

  const canAssignTasks = (): boolean => {
    return hasPermission('tasks:assign');
  };

  const canDeleteTasks = (): boolean => {
    return hasPermission('tasks:delete');
  };

  const canManageHorses = (): boolean => {
    return hasPermission('horses:write');
  };

  const canDeleteHorses = (): boolean => {
    return hasPermission('horses:delete');
  };

  const canViewMedicalHistory = (): boolean => {
    return hasPermission('horses:view_medical');
  };

  const canEditMedicalHistory = (): boolean => {
    return hasPermission('horses:edit_medical');
  };

  const canManageUsers = (): boolean => {
    return hasPermission('users:write');
  };

  const getUserRole = (): UserRole | null => {
    return user?.rol?.clave as UserRole || null;
  };

  // Helpers de roles específicos
  const isAdmin = getUserRole() === 'admin';
  const isEstablecimiento = getUserRole() === 'establecimiento';
  const isVeterinario = getUserRole() === 'veterinario';
  const isCapataz = getUserRole() === 'capataz';
  const isEmpleado = getUserRole() === 'empleado';
  const isPropietario = getUserRole() === 'propietario';

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canCreateEvents,
    canCreateMedicalEvents,
    canDeleteEvents,
    canCreateTasks,
    canAssignTasks,
    canDeleteTasks,
    canManageHorses,
    canDeleteHorses,
    canViewMedicalHistory,
    canEditMedicalHistory,
    canManageUsers,
    getUserRole,
    isAdmin,
    isEstablecimiento,
    isVeterinario,
    isCapataz,
    isEmpleado,
    isPropietario,
    user
  };
}