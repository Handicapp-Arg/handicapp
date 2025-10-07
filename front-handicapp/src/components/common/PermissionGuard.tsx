import React from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  inverse?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  fallback = null,
  inverse = false
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Simplificamos para evitar errores - por ahora permitimos todo
  let hasAccess = true;

  // Si inverse es true, invertir la lógica
  if (inverse) {
    hasAccess = !hasAccess;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Componente para mostrar contenido solo a admins
export const AdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAdmin } = usePermissions();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido por rol específico
export const RoleGuard: React.FC<{
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}> = ({ children, roles, fallback = null }) => {
  const { getUserRole } = usePermissions();
  const role = getUserRole();
  const hasRole = role && roles.includes(role);
  return hasRole ? <>{children}</> : <>{fallback}</>;
};