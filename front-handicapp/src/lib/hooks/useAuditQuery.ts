/**
 * React Query Hooks para Auditoría
 * 
 * Sistema de hooks para logs de auditoría con cache automático.
 */

import { useQuery } from '@tanstack/react-query';
import { auditoriaService } from '../services/auditoriaService';

// ==================== QUERY KEYS ====================

export const auditoriaKeys = {
  all: ['auditoria'] as const,
  lists: () => [...auditoriaKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...auditoriaKeys.lists(), filters] as const,
  details: () => [...auditoriaKeys.all, 'detail'] as const,
  detail: (id: number) => [...auditoriaKeys.details(), id] as const,
  stats: () => [...auditoriaKeys.all, 'stats'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener logs de auditoría con filtros
 * Cache: 2 minutos
 */
export function useAuditoria(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: auditoriaKeys.list(filters),
    queryFn: () => auditoriaService.getAuditorias(filters || {}),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener un log específico
 * Cache: 10 minutos
 */
export function useAuditoriaDetalle(id: number) {
  return useQuery({
    queryKey: auditoriaKeys.detail(id),
    queryFn: () => auditoriaService.getAuditoriaById(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id && id > 0,
  });
}

/**
 * Hook para obtener estadísticas de auditoría
 * Cache: 5 minutos
 */
export function useAuditoriaStats() {
  return useQuery({
    queryKey: auditoriaKeys.stats(),
    queryFn: () => auditoriaService.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
