import React from 'react';
import { useSimplePermissions } from '@/lib/hooks/useSimplePermissions';

interface SimplePermissionGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export const SimplePermissionGuard: React.FC<SimplePermissionGuardProps> = ({
  children,
  roles,
  fallback = null
}) => {
  const { userRole } = useSimplePermissions();
  const hasRole = userRole && roles.includes(userRole);
  return hasRole ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido solo a admins
export const SimpleAdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAdmin } = useSimplePermissions();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

// Componente para mostrar contenido por rol específico
export const SimpleRoleGuard: React.FC<{
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}> = ({ children, roles, fallback = null }) => {
  const { userRole } = useSimplePermissions();
  const hasRole = userRole && roles.includes(userRole);
  return hasRole ? <>{children}</> : <>{fallback}</>;
};