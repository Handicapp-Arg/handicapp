/**
 * 🚀 OPTIMIZACIONES CRÍTICAS DE RENDIMIENTO
 * Hook optimizado para dashboard stats con 1 sola llamada API
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { httpJson } from '@/lib/http';
import { useAuthNew } from './useAuthNew';

export interface OptimizedDashboardStats {
  caballos: {
    total: number;
    activos: number;
    conEventos: number;
    nuevos: number;
  };
  eventos: {
    total: number;
    urgentes: number;
    programados: number;
    completados: number;
  };
  tareas: {
    total: number;
    pendientes: number;
    completadas: number;
    enProgreso: number;
  };
  empleados?: {
    total: number;
    activos: number;
    departamentos: number;
    nuevos: number;
  };
  inventario?: {
    total: number;
    stockBajo: number;
    categorias: number;
    valorTotal: number;
  };
  establecimientos?: {
    total: number;
    activos: number;
  };
}

/**
 * Hook optimizado que hace 1 sola llamada API para todas las estadísticas
 * Incluye cache agresivo y smart refetch
 */
export function useOptimizedStats() {
  const { isAuthenticated, user } = useAuthNew();

  return useQuery({
    queryKey: ['dashboard-stats', user?.rol?.clave],
    queryFn: async () => {
      const response = await httpJson<OptimizedDashboardStats>('/dashboard/stats');
      return response;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,        // 5 minutos - datos frescos
    gcTime: 10 * 60 * 1000,          // 10 minutos en cache
    refetchOnWindowFocus: false,      // No refetch en focus
    refetchOnReconnect: false,        // No refetch en reconnect
    retry: 1,                         // Solo 1 retry
    retryDelay: 2000,                 // 2s delay
  });
}

/**
 * Hook legacy para migración gradual
 * @deprecated Usar useOptimizedStats
 */
export function useStats() {
  console.warn('🚨 useStats is deprecated. Use useOptimizedStats for better performance');
  
  const { data, isLoading, error } = useOptimizedStats();
  
  return {
    stats: data || {
      caballos: { total: 0, activos: 0, conEventos: 0, nuevos: 0 },
      eventos: { total: 0, urgentes: 0, programados: 0, completados: 0 },
      tareas: { total: 0, pendientes: 0, completadas: 0, enProgreso: 0 },
      empleados: { total: 0, activos: 0, departamentos: 0, nuevos: 0 },
      inventario: { total: 0, stockBajo: 0, categorias: 0, valorTotal: 0 }
    },
    loading: isLoading,
    error
  };
}