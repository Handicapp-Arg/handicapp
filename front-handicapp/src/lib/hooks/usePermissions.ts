// Hook disabled to avoid conflicts with SimplePermissionGuard
// Use SimplePermissionGuard instead

export const usePermissions = () => {
  return {
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    can: {},
    userRole: null,
    isAdmin: false,
    isEstablecimiento: false,
    isVeterinario: false,
    isCapataz: false,
    isEmpleado: false,
    isPropietario: false
  };
};