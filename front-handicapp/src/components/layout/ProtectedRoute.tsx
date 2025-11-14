'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ApiClient from '@/lib/services/apiClient';
import { LOGOS } from '@/lib/constants/logos';

/**
 * Componente de protección de rutas basado en roles
 * OPTIMIZADO: Usa cache para evitar verificaciones repetidas en navegación rápida
 * El middleware ya valida la cookie, este componente solo verifica rol y permisos
 */

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: '/admin',
  establecimiento: '/establecimiento',
  capataz: '/capataz', 
  veterinario: '/veterinario',
  empleado: '/empleado',
  propietario: '/propietario'
};

// Cache de verificación (válido por 30 segundos)
let authCache: {
  isValid: boolean;
  userRole: string | null;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30000; // 30 segundos

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const checkInProgress = useRef(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Evitar múltiples verificaciones simultáneas
      if (checkInProgress.current) return;
      
      // Verificar cache primero
      const now = Date.now();
      if (authCache && (now - authCache.timestamp) < CACHE_DURATION) {
        const userRole = authCache.userRole;
        if (userRole && authCache.isValid) {
          const allowedPath = DASHBOARD_ROUTES[userRole];
          if (allowedPath && pathname.startsWith(allowedPath)) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }
        }
      }

      try {
        checkInProgress.current = true;
        
        // Verificar autenticación con el backend (las cookies httpOnly se envían automáticamente)
        const response: any = await ApiClient.verifyToken();
        
        // El backend devuelve: { success: true, data: { valid: true, user: { id, email, role } } }
        if (!response || !response.success || !response.data || !response.data.user || !response.data.valid) {
          authCache = { isValid: false, userRole: null, timestamp: now };
          router.replace('/login');
          return;
        }

        const user = response.data.user;
        const userRole = user.role; // 'admin', 'establecimiento', 'capataz', 'veterinario', 'empleado', 'propietario'
        
        if (!userRole) {
          authCache = { isValid: false, userRole: null, timestamp: now };
          router.replace('/login');
          return;
        }

        const allowedPath = DASHBOARD_ROUTES[userRole];
        
        if (!allowedPath) {
          authCache = { isValid: false, userRole: null, timestamp: now };
          router.replace('/login');
          return;
        }
        
        // Si está en una ruta no permitida para su rol, redirigir
        if (!pathname.startsWith(allowedPath)) {
          router.replace(allowedPath);
          return;
        }

        // Actualizar cache
        authCache = { isValid: true, userRole, timestamp: now };
        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        authCache = { isValid: false, userRole: null, timestamp: Date.now() };
        setIsLoading(false);
        router.replace('/login');
      } finally {
        checkInProgress.current = false;
      }
    };

    checkAccess();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          {/* Logo con animación de pulso */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-[#0f172a]"></div>
            </div>
            <div className="relative bg-[#0f172a] w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Image 
                src={LOGOS.ICON_WHITE}
                alt="HandicApp" 
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
          
          {/* Spinner debajo del logo */}
          <div className="flex justify-center">
            <div className="w-8 h-8 border-3 border-[#af936f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          {/* Logo con animación de pulso */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <div className="w-24 h-24 mx-auto rounded-2xl bg-[#0f172a]"></div>
            </div>
            <div className="relative bg-[#0f172a] w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Image 
                src={LOGOS.ICON_WHITE}
                alt="HandicApp" 
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
          </div>
          
          {/* Spinner debajo del logo */}
          <div className="flex justify-center">
            <div className="w-8 h-8 border-3 border-[#af936f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}