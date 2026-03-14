'use client';

import { useState, useEffect } from 'react';
import AuthManager, { type AuthState } from '../auth/AuthManager';

// Mapeo de roles por ID
const ROLE_MAPPING: Record<number, string> = {
  1: 'admin',
  2: 'establecimiento',
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario',
};

function extractRole(state: AuthState): string | null {
  const id = state.user?.rol?.id;
  return id ? (ROLE_MAPPING[id] || null) : null;
}

export const useSimplePermissions = () => {
  // Read synchronously on first render so guards don't flash blank
  const [userRole, setUserRole] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return extractRole(AuthManager.getInstance().getState());
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return AuthManager.getInstance().getState().isLoading;
  });

  useEffect(() => {
    const unsubscribe = AuthManager.getInstance().subscribe((state) => {
      setIsAuthLoading(state.isLoading);
      setUserRole(extractRole(state));
    });
    return unsubscribe;
  }, []);

  return {
    userRole,
    isAuthLoading,
    isAdmin: userRole === 'admin',
    isEstablecimiento: userRole === 'establecimiento',
    isVeterinario: userRole === 'veterinario',
    isCapataz: userRole === 'capataz',
    isEmpleado: userRole === 'empleado',
    isPropietario: userRole === 'propietario',
  };
};
