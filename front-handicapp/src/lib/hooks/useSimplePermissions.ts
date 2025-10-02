'use client';

import { useState, useEffect } from 'react';

// Mapeo de roles por ID
const ROLE_MAPPING: Record<number, string> = {
  1: 'admin',
  2: 'establecimiento', 
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario'
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const useSimplePermissions = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const roleStr = getCookie('role');
    if (roleStr) {
      const roleId = parseInt(roleStr);
      setUserRole(ROLE_MAPPING[roleId] || null);
    }
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