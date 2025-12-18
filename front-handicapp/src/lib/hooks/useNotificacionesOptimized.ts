/**
 * 🚀 HOOK OPTIMIZADO PARA NOTIFICACIONES
 * Cache inteligente y polling eficiente para notificaciones
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpJson } from '@/lib/http';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  leida: boolean;
  fechaCreacion: string;
  fechaLectura?: string;
}

interface NotificacionesResponse {
  notificaciones: Notificacion[];
  noLeidas: number;
  total: number;
}

interface UseNotificacionesOptimizedOptions {
  limit?: number;
  soloNoLeidas?: boolean;
  /** Polling automático (default: 30 segundos) */
  refetchInterval?: number | false;
  /** Solo para pruebas */
  enabled?: boolean;
}

const DEFAULT_OPTIONS = {
  limit: 10,
  soloNoLeidas: false,
  refetchInterval: 30 * 1000, // 30 segundos
  enabled: true,
} as const;

/**
 * Hook optimizado para notificaciones con cache inteligente
 * - Cache de 1 minuto para datos frescos
 * - Polling cada 30s para notificaciones en tiempo real
 * - Background refresh para mejor UX
 */
export function useNotificacionesOptimized(options: UseNotificacionesOptimizedOptions = {}) {
  const { limit, soloNoLeidas, refetchInterval, enabled } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  return useQuery<NotificacionesResponse, Error>({
    queryKey: [
      'notificaciones', 
      'optimized', 
      { limit, soloNoLeidas }
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (soloNoLeidas) {
        params.append('soloNoLeidas', 'true');
      }
      
      const response = await httpJson<NotificacionesResponse>(
        `/notificaciones?${params.toString()}`
      );
      
      return response;
    },
    
    // 🚀 Configuración de cache optimizada para notificaciones
    staleTime: 1 * 60 * 1000,   // 1 minuto - datos "frescos"
    gcTime: 5 * 60 * 1000,      // 5 minutos - tiempo en cache
    
    // 🚀 Polling inteligente para notificaciones en tiempo real
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: true, // Continúa polling en background
    refetchOnWindowFocus: true,        // Refresh al volver a la tab
    
    // 🚀 Optimizaciones de UX
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    enabled,
  });
}

/**
 * Hook ligero para solo contar notificaciones no leídas
 * Ideal para badges y contadores
 */
export function useNotificacionesCount() {
  return useQuery<Pick<NotificacionesResponse, 'noLeidas'>, Error>({
    queryKey: ['notificaciones', 'count'],
    queryFn: async () => {
      const response = await httpJson<Pick<NotificacionesResponse, 'noLeidas'>>(
        '/notificaciones/count'
      );
      return response;
    },
    
    // 🚀 Cache muy agresivo para contadores simples
    staleTime: 2 * 60 * 1000,   // 2 minutos
    gcTime: 10 * 60 * 1000,     // 10 minutos
    
    // 🚀 Polling más frecuente para badges en tiempo real
    refetchInterval: 15 * 1000, // 15 segundos
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    
    retry: 1,
  });
}

/**
 * Hook para marcar notificaciones como leídas con optimistic updates
 */
export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificacionId: number) => {
      await httpJson(`/notificaciones/${notificacionId}/marcar-leida`, {
        method: 'PUT',
      });
    },
    
    // 🚀 Optimistic update para UX instantáneo
    onMutate: async (notificacionId: number) => {
      // Cancelar queries en vuelo
      await queryClient.cancelQueries({ 
        queryKey: ['notificaciones', 'optimized'] 
      });
      await queryClient.cancelQueries({ 
        queryKey: ['notificaciones', 'count'] 
      });
      
      // Snapshot de datos actuales
      const previousNotificaciones = queryClient.getQueryData(['notificaciones', 'optimized']);
      const previousCount = queryClient.getQueryData(['notificaciones', 'count']);
      
      // Actualizar optimísticamente
      queryClient.setQueryData(['notificaciones', 'optimized'], (old: NotificacionesResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          notificaciones: old.notificaciones.map(n => 
            n.id === notificacionId 
              ? { ...n, leida: true, fechaLectura: new Date().toISOString() }
              : n
          ),
          noLeidas: Math.max(0, old.noLeidas - 1),
        };
      });
      
      queryClient.setQueryData(['notificaciones', 'count'], (old: Pick<NotificacionesResponse, 'noLeidas'> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          noLeidas: Math.max(0, old.noLeidas - 1),
        };
      });
      
      return { previousNotificaciones, previousCount };
    },
    
    // 🚀 Rollback en caso de error
    onError: (err: any, notificacionId: number, context: any) => {
      if (context?.previousNotificaciones) {
        queryClient.setQueryData(['notificaciones', 'optimized'], context.previousNotificaciones);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['notificaciones', 'count'], context.previousCount);
      }
    },
    
    // 🚀 Refetch para sincronizar con servidor
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
}

// Re-exportar para compatibilidad
export { useNotificacionesOptimized as useNotificaciones };