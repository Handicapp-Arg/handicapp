'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';

/**
 * Componente de protección de rutas basado en roles
 * Verifica la autenticación del usuario haciendo request al backend
 * (las cookies httpOnly se envían automáticamente)
 */

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: '/admin',
  establecimiento: '/establecimiento',
  capataz: '/capataz', 
  veterinario: '/veterinario',
  empleado: '/empleado',
  propietario: '/propietario'
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Verificar autenticación con el backend (las cookies httpOnly se envían automáticamente)
        const response: any = await ApiClient.verifyToken();
        
        if (!response || !response.success || !response.data || !response.data.user) {
          router.replace('/login');
          return;
        }

        const user = response.data.user;
        const userRole = user.role; // 'admin', 'establecimiento', etc.
        
        if (!userRole) {
          router.replace('/login');
          return;
        }

        const allowedPath = DASHBOARD_ROUTES[userRole];
        
        if (!allowedPath) {
          router.replace('/login');
          return;
        }
        
        // Si está en una ruta no permitida para su rol, redirigir
        if (!pathname.startsWith(allowedPath)) {
          router.replace(allowedPath);
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        router.replace('/login');
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg text-gray-600">Verificando permisos...</div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg text-gray-600">Redirigiendo...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}