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
  fallback = null,
}) => {
  const { userRole, isAuthLoading } = useSimplePermissions();
  if (isAuthLoading) return null;
  const hasRole = userRole && roles.includes(userRole);
  return hasRole ? <>{children}</> : <>{fallback}</>;
};

export const SimpleAdminOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { isAdmin, isAuthLoading } = useSimplePermissions();
  if (isAuthLoading) return null;
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

export const SimpleRoleGuard: React.FC<{
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}> = ({ children, roles, fallback = null }) => {
  const { userRole, isAuthLoading } = useSimplePermissions();
  if (isAuthLoading) return null;
  const hasRole = userRole && roles.includes(userRole);
  return hasRole ? <>{children}</> : <>{fallback}</>;
};
