'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, useState } from 'react';

// Lazy load React Query Devtools (solo en desarrollo)
const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((mod) => ({
    default: mod.ReactQueryDevtools,
  }))
);

/**
 * React Query Provider
 * 
 * Configuración optimizada para HandicApp:
 * - Cache de 5 minutos por defecto
 * - Retry automático en errores
 * - Refetch en focus de ventana
 * - DevTools solo en desarrollo (lazy loaded)
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,     // 5 minutos — balance freshness/performance
            gcTime: 30 * 60 * 1000,        // 30 minutos en cache antes de liberar memoria

            retry: 1,                       // 1 reintento en errores de red transitorios
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            refetchOnWindowFocus: false,    // No refetch al cambiar de pestaña (UX intrusivo)
            refetchOnReconnect: true,       // Sí refetch al reconectar red
            refetchOnMount: false,          // Usar cache si está fresco

            networkMode: 'online',
            throwOnError: false,
          },
          mutations: {
            // Retry en mutaciones solo si es error de red
            retry: (failureCount, error: unknown) => {
              // No reintentar en errores 4xx (errores del cliente)
              const httpError = error as { status?: number };
              if (httpError?.status && httpError.status >= 400 && httpError.status < 500) {
                return false;
              }
              // Reintentar hasta 2 veces en errores de red o 5xx
              return failureCount < 2;
            },
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo - lazy loaded */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}
