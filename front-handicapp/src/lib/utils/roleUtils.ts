/**
 * Utility functions for role-based redirections
 */

export type UserRole = 'admin' | 'establecimiento' | 'capataz' | 'veterinario' | 'empleado' | 'propietario';

export const ROLE_ID_TO_ROLE_KEY: Record<number, UserRole> = {
  1: 'admin',
  2: 'establecimiento', 
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario'
};

export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  establecimiento: '/establecimiento',
  capataz: '/capataz', 
  veterinario: '/veterinario',
  empleado: '/empleado',
  propietario: '/propietario'
};

/**
 * Get the dashboard route for a user role ID
 */
export function getDashboardRoute(roleId: number): string {
  const roleKey = ROLE_ID_TO_ROLE_KEY[roleId];
  if (!roleKey) {
    console.warn(`Unknown role ID: ${roleId}, redirecting to default`);
    return '/';
  }
  return ROLE_DASHBOARD_ROUTES[roleKey];
}

/**
 * Get the role key from role ID
 */
export function getRoleKey(roleId: number): UserRole | null {
  return ROLE_ID_TO_ROLE_KEY[roleId] || null;
}

/**
 * Check if a role ID is valid
 */
export function isValidRoleId(roleId: number): boolean {
  return roleId in ROLE_ID_TO_ROLE_KEY;
}