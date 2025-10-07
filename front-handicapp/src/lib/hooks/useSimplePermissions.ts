'use client';

import { useState, useEffect } from 'react';
import AuthManager from '../auth/AuthManager';

// Mapeo de roles por ID
const ROLE_MAPPING: Record<number, string> = {
  1: 'admin',
  2: 'establecimiento', 
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario'
};

export const useSimplePermissions = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    
    const unsubscribe = authManager.subscribe((authState) => {
      if (authState.user?.rol?.id) {
        const role = ROLE_MAPPING[authState.user.rol.id] || null;
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });

    return unsubscribe;
  }, []);

  return {
    userRole,
    isAdmin: userRole === 'admin',
    isEstablecimiento: userRole === 'establecimiento',
    isVeterinario: userRole === 'veterinario',
    isCapataz: userRole === 'capataz',
    isEmpleado: userRole === 'empleado',
    isPropietario: userRole === 'propietario'
  };
};