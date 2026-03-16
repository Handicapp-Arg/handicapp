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
    '/propietario/horses',
    '/propietario/notifications',
    '/propietario/events',
  ],
  admin: [
    '/admin/users',
    '/admin/stables',
    '/admin/horses',
  ],
  establecimiento: [
    '/establecimiento/horses',
    '/establecimiento/events',
    '/establecimiento/personal',
  ],
};

export function PrefetchManager({ role }: { role?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefetchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!role || !PRIORITY_ROUTES[role]) return;

    const routes = PRIORITY_ROUTES[role];

    const prefetchRoutes = () => {
      routes.forEach(route => {
        if (!prefetchedRef.current.has(route) && pathname !== route) {
          router.prefetch(route);
          prefetchedRef.current.add(route);
        }
      });
    };

    // Prefetch as soon as the browser is idle — no artificial delays
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(prefetchRoutes, { timeout: 1000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(prefetchRoutes, 100);
      return () => clearTimeout(id);
    }
  }, [role, router, pathname]);

  return null;
}
