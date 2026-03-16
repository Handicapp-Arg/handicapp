/**
 * React Query Hooks para Gestión de Establecimientos
 * 
 * Sistema de hooks para manejo de establecimientos con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  establecimientoService, 
  type EstablecimientoFilters,
  type CreateEstablecimientoData 
} from '../services/stableService';

// ==================== QUERY KEYS ====================

export const establecimientosKeys = {
  all: ['establecimientos'] as const,
  lists: () => [...establecimientosKeys.all, 'list'] as const,
  list: (filters?: EstablecimientoFilters) => [...establecimientosKeys.lists(), filters] as const,
  details: () => [...establecimientosKeys.all, 'detail'] as const,
  detail: (id: number) => [...establecimientosKeys.details(), id] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener todos los establecimientos
 * Cache: 5 minutos (datos relativamente estáticos)
 */
export function useEstablecimientos(filters?: EstablecimientoFilters) {
  return useQuery({
    queryKey: establecimientosKeys.list(filters),
    queryFn: () => establecimientoService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener detalle de un establecimiento
 * Cache: 10 minutos
 */
export function useEstablecimiento(id: number) {
  return useQuery({
    queryKey: establecimientosKeys.detail(id),
    queryFn: () => establecimientoService.getById(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id && id > 0,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un nuevo establecimiento
 */
export function useCreateEstablecimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEstablecimientoData) => establecimientoService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientosKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un establecimiento
 */
export function useUpdateEstablecimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateEstablecimientoData> }) => 
      establecimientoService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: establecimientosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: establecimientosKeys.detail(variables.id) });
    },
  });
}

/**
 * Hook para eliminar un establecimiento
 */
export function useDeleteEstablecimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => establecimientoService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: establecimientosKeys.lists() });
    },
  });
}
