'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Prefetch Manager - Pre-carga rutas comunes
 * 
 * Este componente pre-carga las rutas más comunes para mejorar la navegación.
 * Se ejecuta después de que la página inicial esté lista.
 */

const PROPIETARIO_ROUTES = [
  '/propietario',
  '/propietario/caballos',
  '/propietario/notificaciones',
  '/propietario/eventos',
  '/propietario/salud',
  '/propietario/configuracion',
  '/propietario/perfil',
];

const ADMIN_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/establecimientos',
  '/admin/caballos',
  '/admin/configuracion',
];

export function PrefetchManager({ role }: { role?: string }) {
  const router = useRouter();

  useEffect(() => {
    // Esperar 2 segundos después de la carga inicial
    const timeout = setTimeout(() => {
      const routes = role === 'propietario' ? PROPIETARIO_ROUTES : 
                     role === 'admin' ? ADMIN_ROUTES : [];
      
      // Prefetch todas las rutas
      routes.forEach(route => {
        router.prefetch(route);
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [role, router]);

  return null; // No renderiza nada
}
