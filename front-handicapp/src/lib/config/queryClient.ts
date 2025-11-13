/**
 * Configuración optimizada de React Query
 * Mejora el performance con caching inteligente
 */

import { QueryClient } from '@tanstack/react-query';

// Tiempos de caché (en milisegundos)
const CACHE_TIMES = {
  // Datos que cambian raramente
  STATIC: 60 * 60 * 1000, // 1 hora
  
  // Datos que cambian ocasionalmente
  SEMI_STATIC: 10 * 60 * 1000, // 10 minutos
  
  // Datos que cambian frecuentemente
  DYNAMIC: 2 * 60 * 1000, // 2 minutos
  
  // Datos en tiempo real
  REALTIME: 30 * 1000, // 30 segundos
};

export { CACHE_TIMES };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración general para todas las queries
      staleTime: CACHE_TIMES.SEMI_STATIC, // Datos considerados frescos por 10 min
      gcTime: CACHE_TIMES.STATIC, // Mantener en caché por 1 hora
      
      // No refetch automático en muchos casos
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false,
      
      // Retry strategy
      retry: (failureCount, error: any) => {
        // No reintentar errores 4xx (errores del cliente)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Reintentar solo una vez para errores 5xx (errores del servidor)
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Optimización de performance
      structuralSharing: true,
    },
    mutations: {
      // Configuración para mutations
      retry: false,
      gcTime: 0, // No cachear mutations
    },
  },
});

/**
 * Query keys para consistencia y type safety
 */
export const queryKeys = {
  // Caballos
  caballos: {
    all: ['caballos'] as const,
    lists: () => [...queryKeys.caballos.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.caballos.lists(), { filters }] as const,
    details: () => [...queryKeys.caballos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.caballos.details(), id] as const,
    stats: () => [...queryKeys.caballos.all, 'stats'] as const,
  },
  
  // Establecimientos
  establecimientos: {
    all: ['establecimientos'] as const,
    lists: () => [...queryKeys.establecimientos.all, 'list'] as const,
    list: (filters?: string) => [...queryKeys.establecimientos.lists(), { filters }] as const,
    details: () => [...queryKeys.establecimientos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.establecimientos.details(), id] as const,
    stats: () => [...queryKeys.establecimientos.all, 'stats'] as const,
  },
  
  // Eventos
  eventos: {
    all: ['eventos'] as const,
    lists: () => [...queryKeys.eventos.all, 'list'] as const,
    list: (caballoId?: number) => [...queryKeys.eventos.lists(), { caballoId }] as const,
    details: () => [...queryKeys.eventos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.eventos.details(), id] as const,
    stats: (caballoId?: number) => [...queryKeys.eventos.all, 'stats', { caballoId }] as const,
  },
  
  // Gastos
  gastos: {
    all: ['gastos'] as const,
    lists: () => [...queryKeys.gastos.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.gastos.lists(), filters] as const,
    details: () => [...queryKeys.gastos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.gastos.details(), id] as const,
    stats: () => [...queryKeys.gastos.all, 'stats'] as const,
  },
  
  // Inventario
  inventario: {
    all: ['inventario'] as const,
    productos: () => [...queryKeys.inventario.all, 'productos'] as const,
    producto: (id: number) => [...queryKeys.inventario.productos(), id] as const,
    movimientos: () => [...queryKeys.inventario.all, 'movimientos'] as const,
    stats: () => [...queryKeys.inventario.all, 'stats'] as const,
  },
  
  // Usuarios
  usuarios: {
    all: ['usuarios'] as const,
    lists: () => [...queryKeys.usuarios.all, 'list'] as const,
    list: (rol?: string) => [...queryKeys.usuarios.lists(), { rol }] as const,
    details: () => [...queryKeys.usuarios.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.usuarios.details(), id] as const,
    current: () => [...queryKeys.usuarios.all, 'current'] as const,
  },
  
  // Tratamientos
  tratamientos: {
    all: ['tratamientos'] as const,
    lists: () => [...queryKeys.tratamientos.all, 'list'] as const,
    list: (caballoId?: number) => [...queryKeys.tratamientos.lists(), { caballoId }] as const,
    details: () => [...queryKeys.tratamientos.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tratamientos.details(), id] as const,
  },
  
  // Tareas
  tareas: {
    all: ['tareas'] as const,
    lists: () => [...queryKeys.tareas.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.tareas.lists(), filters] as const,
    details: () => [...queryKeys.tareas.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.tareas.details(), id] as const,
    stats: () => [...queryKeys.tareas.all, 'stats'] as const,
  },
  
  // Notificaciones
  notificaciones: {
    all: ['notificaciones'] as const,
    lists: () => [...queryKeys.notificaciones.all, 'list'] as const,
    list: (leida?: boolean) => [...queryKeys.notificaciones.lists(), { leida }] as const,
    unread: () => [...queryKeys.notificaciones.all, 'unread'] as const,
  },
};

/**
 * Prefetch strategies para mejorar UX
 */
export const prefetchStrategies = {
  // Prefetch de datos relacionados al navegar a detalles
  onNavigateToDetail: async (type: 'caballo' | 'establecimiento' | 'evento', id: number) => {
    const prefetchMap = {
      caballo: [
        queryKeys.eventos.list(id),
        queryKeys.tratamientos.list(id),
        queryKeys.gastos.list({ caballoId: id }),
      ],
      establecimiento: [
        queryKeys.establecimientos.detail(id),
      ],
      evento: [
        queryKeys.eventos.detail(id),
      ],
    };
    
    // Prefetch en paralelo
    await Promise.all(
      prefetchMap[type].map((key) => 
        queryClient.prefetchQuery({
          queryKey: key,
          staleTime: CACHE_TIMES.DYNAMIC,
        })
      )
    );
  },
  
  // Prefetch de dashboard data al login
  onLogin: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.caballos.lists(),
        staleTime: CACHE_TIMES.SEMI_STATIC,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.establecimientos.stats(),
        staleTime: CACHE_TIMES.SEMI_STATIC,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.notificaciones.unread(),
        staleTime: CACHE_TIMES.REALTIME,
      }),
    ]);
  },
};
