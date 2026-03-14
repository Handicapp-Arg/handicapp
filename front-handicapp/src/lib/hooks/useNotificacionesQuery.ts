/**
 * React Query Hooks para Notificaciones
 * 
 * Sistema de hooks para manejo de notificaciones con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionService, type NotificacionFiltros } from '../services/notificacionService';

// ==================== QUERY KEYS ====================

export const notificacionesKeys = {
  all: ['notificaciones'] as const,
  lists: () => [...notificacionesKeys.all, 'list'] as const,
  list: (filtros?: NotificacionFiltros) => [...notificacionesKeys.lists(), filtros] as const,
  stats: () => [...notificacionesKeys.all, 'stats'] as const,
  noLeidas: () => [...notificacionesKeys.all, 'no-leidas'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener notificaciones con filtros
 * Cache: 1 minuto (datos que cambian frecuentemente)
 */
export function useNotificaciones(filtros?: NotificacionFiltros) {
  return useQuery({
    queryKey: notificacionesKeys.list(filtros),
    queryFn: () => notificacionService.obtenerNotificaciones(filtros),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener solo notificaciones no leídas
 * Cache: 30 segundos
 */
export function useNotificacionesNoLeidas() {
  return useQuery({
    queryKey: notificacionesKeys.noLeidas(),
    queryFn: () => notificacionService.obtenerNotificaciones({ leida: false }),
    staleTime: 30 * 1000, // 30 segundos
  });
}

/**
 * Hook para obtener estadísticas de notificaciones
 * Cache: 2 minutos
 */
export function useNotificacionesStats() {
  return useQuery({
    queryKey: notificacionesKeys.stats(),
    queryFn: () => notificacionService.obtenerEstadisticas(),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para marcar una notificación como leída
 */
export function useMarcarNotificacionLeida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificacionService.marcarComoLeida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.noLeidas() });
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.stats() });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificacionService.marcarTodasComoLeidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

/**
 * Hook para eliminar una notificación
 */
export function useEliminarNotificacion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificacionService.eliminarNotificacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificacionesKeys.all });
    },
  });
}

