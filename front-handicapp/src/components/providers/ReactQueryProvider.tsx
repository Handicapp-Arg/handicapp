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
            // 🚀 MEJORA: Cache time AUMENTADO para máxima performance
            staleTime: 60 * 60 * 1000,    // 60 minutos (antes: 30min)
            gcTime: 2 * 60 * 60 * 1000,   // 2 horas (antes: 60min)
            
            // 🚀 MEJORA: Sin retry para ser más rápido
            retry: 0, // Sin retry (antes: 1)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Refetch configuration - MÁXIMA PERFORMANCE
            refetchOnWindowFocus: false, // Desactivado
            refetchOnReconnect: false,   // Desactivado
            refetchOnMount: false,       // NO refetch (usar cache siempre)
            
            // Network mode - solo hacer requests con red
            networkMode: 'online',
            
            // Error handling
            throwOnError: false, // No lanzar errores, manejarlos con isError
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
