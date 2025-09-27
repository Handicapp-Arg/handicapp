'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Componente de protección de rutas basado en roles
 * Verifica la autenticación del usuario y lo redirige a su área autorizada
 * según su rol definido en el sistema
 */

// Mapeo de roles
const ROLE_MAPPING: Record<number, string> = {
  1: 'admin',
  2: 'establecimiento', 
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario'
};

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: '/admin',
  establecimiento: '/establecimiento',
  capataz: '/capataz', 
  veterinario: '/veterinario',
  empleado: '/empleado',
  propietario: '/propietario'
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Obtener cookies
      const token = getCookie('auth-token');
      const roleStr = getCookie('role');
      
      if (!token || !roleStr) {
        router.replace('/login');
        return;
      }

      const roleId = parseInt(roleStr);
      const userRole = ROLE_MAPPING[roleId];
      
      if (!userRole) {
        router.replace('/login');
        return;
      }

      const allowedPath = DASHBOARD_ROUTES[userRole];
      
      if (!pathname.startsWith(allowedPath)) {
        router.replace(allowedPath);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkAccess();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Verificando permisos...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Redirigiendo...</div>
      </div>
    );
  }

  return <>{children}</>;
}