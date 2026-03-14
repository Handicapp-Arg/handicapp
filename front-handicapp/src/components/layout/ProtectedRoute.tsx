'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import AuthManager from '@/lib/auth/AuthManager';
import { LOGOS } from '@/lib/constants/logos';

/**
 * ProtectedRoute — guarda de rutas basado en AuthManager (sin llamada de red).
 *
 * Flujo optimizado:
 * 1. Lee el estado de AuthManager desde memoria/localStorage de forma SINCRÓNICA.
 * 2. Si el usuario ya está autenticado → muestra el contenido INMEDIATAMENTE.
 * 3. AuthManager verifica el token en background (no bloquea la UI).
 * 4. Si el token expira (401/403 del backend), AuthManager limpia la sesión y
 *    el subscribe de abajo redirige al login automáticamente.
 *
 * Eliminamos la llamada a ApiClient.verifyToken() que bloqueaba cada navegación.
 */

const DASHBOARD_ROUTES: Record<string, string> = {
  admin: '/admin',
  establecimiento: '/establecimiento',
  capataz: '/capataz',
  veterinario: '/veterinario',
  empleado: '/empleado',
  propietario: '/propietario',
};

const ROLE_MAPPING: Record<number, string> = {
  1: 'admin',
  2: 'establecimiento',
  3: 'capataz',
  4: 'veterinario',
  5: 'empleado',
  6: 'propietario',
};

function getUserRole(user: any): string | null {
  if (!user) return null;
  // Por ID de rol
  if (user.rol?.id) return ROLE_MAPPING[user.rol.id] || null;
  // Por clave directa
  if (user.rol?.clave) return user.rol.clave;
  // Fallback por campo role plano
  if (user.role) return user.role;
  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-24 h-24 mx-auto rounded-2xl bg-slate-950" />
          </div>
          <div className="relative bg-slate-950 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
            <Image
              src={LOGOS.ICON_WHITE}
              alt="HandicApp"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-[3px] border-[#af936f] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Leer AuthManager SINCRÓNICAMENTE en el primer render
  const initialState = typeof window !== 'undefined'
    ? AuthManager.getInstance().getState()
    : null;

  const [authState, setAuthState] = useState({
    isLoading: initialState?.isLoading ?? true,
    isAuthenticated: initialState?.isAuthenticated ?? false,
    user: initialState?.user ?? null,
  });

  // Suscribirse a cambios futuros del AuthManager (ej: token expirado en background)
  useEffect(() => {
    const unsubscribe = AuthManager.getInstance().subscribe((state) => {
      setAuthState({
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      });
    });
    return unsubscribe;
  }, []);

  // Lógica de redirección: solo cuando la carga termina
  useEffect(() => {
    if (authState.isLoading) return;

    if (!authState.isAuthenticated || !authState.user) {
      router.replace('/login');
      return;
    }

    const userRole = getUserRole(authState.user);
    if (!userRole) {
      router.replace('/login');
      return;
    }

    const allowedPath = DASHBOARD_ROUTES[userRole];
    if (!allowedPath) {
      router.replace('/login');
      return;
    }

    // Si está en una ruta de otro rol, redirigir a su ruta correcta
    if (!pathname.startsWith(allowedPath)) {
      router.replace(allowedPath);
    }
  }, [authState.isLoading, authState.isAuthenticated, authState.user, pathname, router]);

  // Mostrar spinner solo durante la inicialización inicial de AuthManager
  if (authState.isLoading) {
    return <LoadingScreen />;
  }

  // No autenticado → no renderizar nada (la redirección ya fue disparada)
  if (!authState.isAuthenticated || !authState.user) {
    return <LoadingScreen />;
  }

  // Verificar que está en la ruta correcta para su rol
  const userRole = getUserRole(authState.user);
  const allowedPath = userRole ? DASHBOARD_ROUTES[userRole] : null;
  if (!allowedPath || !pathname.startsWith(allowedPath)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
