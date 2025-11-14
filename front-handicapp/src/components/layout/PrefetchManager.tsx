'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Prefetch Manager OPTIMIZADO - Pre-carga rutas comunes de forma inteligente
 * 
 * Estrategia:
 * - Solo pre-fetcha las 3 rutas más visitadas
 * - Espera a que la página esté completamente cargada (idle)
 * - Pre-fetcha solo si el usuario está inactivo (no navegando)
 * - Evita saturar la conexión
 */

const PRIORITY_ROUTES: Record<string, string[]> = {
  propietario: [
    '/propietario/caballos',
    '/propietario/notificaciones',
    '/propietario/eventos',
  ],
  admin: [
    '/admin/users',
    '/admin/establecimientos',
    '/admin/caballos',
  ],
  establecimiento: [
    '/establecimiento/caballos',
    '/establecimiento/eventos',
    '/establecimiento/personal',
  ],
  veterinario: [
    '/veterinario/caballos',
    '/veterinario/consultas',
    '/veterinario/tratamientos',
  ],
  capataz: [
    '/capataz/caballos',
    '/capataz/eventos',
    '/capataz/tareas',
  ],
  empleado: [
    '/empleado/caballos',
    '/empleado/eventos',
    '/empleado/tareas',
  ],
};

export function PrefetchManager({ role }: { role?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedRef = useRef<Set<string>>(new Set());
  const isIdleRef = useRef(false);

  useEffect(() => {
    if (!role || !PRIORITY_ROUTES[role]) return;

    // Esperar a que la página esté completamente cargada
    const handleLoad = () => {
      // Esperar 3 segundos adicionales para asegurar que el usuario no está navegando activamente
      setTimeout(() => {
        isIdleRef.current = true;
        prefetchRoutes();
      }, 3000);
    };

    const prefetchRoutes = () => {
      if (!isIdleRef.current) return;
      
      const routes = PRIORITY_ROUTES[role] || [];
      
      // Prefetch solo rutas que no están ya cargadas y no son la ruta actual
      routes.forEach(route => {
        if (!prefetchedRef.current.has(route) && pathname !== route) {
          router.prefetch(route);
          prefetchedRef.current.add(route);
        }
      });
    };

    // Si la página ya está cargada, ejecutar inmediatamente
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Prefetch cuando el usuario está inactivo (idle)
    let idleTimeout: NodeJS.Timeout;
    const handleIdle = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        isIdleRef.current = true;
        prefetchRoutes();
      }, 2000); // 2 segundos de inactividad
    };

    // Detectar inactividad del usuario
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleIdle, { passive: true });
    });

    return () => {
      window.removeEventListener('load', handleLoad);
      events.forEach(event => {
        window.removeEventListener(event, handleIdle);
      });
      clearTimeout(idleTimeout);
    };
  }, [role, router, pathname]);

  return null; // No renderiza nada
}
