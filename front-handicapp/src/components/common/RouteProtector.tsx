'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RouteProtectorProps {
  children: React.ReactNode;
}

export const RouteProtector: React.FC<RouteProtectorProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Se está redirigiendo
  }

  return <>{children}</>;
};

// Hook para obtener la ruta por defecto según el rol
export const useDefaultRoute = () => {
  const { user } = useAuth();
  
  const getDefaultRoute = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'establecimiento':
        return '/establecimiento';
      case 'capataz':
        return '/capataz';
      case 'veterinario':
        return '/veterinario';
      case 'empleado':
        return '/empleado';
      case 'propietario':
        return '/propietario';
      default:
        return '/admin';
    }
  };

  return {
    getDefaultRoute: () => user ? getDefaultRoute(user.role) : '/login',
    redirectToDefaultRoute: () => {
      const router = useRouter();
      if (user) {
        router.push(getDefaultRoute(user.role));
      }
    }
  };
};