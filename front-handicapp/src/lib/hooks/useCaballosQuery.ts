/**
 * React Query Hooks para Gestión de Caballos
 * 
 * Sistema de hooks para manejo de caballos, pedigrí, historial médico,
 * propietarios y estadísticas con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  caballoService,
  type CaballoFilters,
  type CreateCaballoData,
  type UpdateCaballoData,
} from '../services/caballoService';

// ==================== QUERY KEYS ====================

export const caballosKeys = {
  all: ['caballos'] as const,
  lists: () => [...caballosKeys.all, 'list'] as const,
  list: (filters: CaballoFilters) => [...caballosKeys.lists(), filters] as const,
  details: () => [...caballosKeys.all, 'detail'] as const,
  detail: (id: number) => [...caballosKeys.details(), id] as const,
  pedigree: (id: number) => [...caballosKeys.all, 'pedigree', id] as const,
  historialMedico: (id: number) => [...caballosKeys.all, 'historial-medico', id] as const,
  propietarios: (id: number) => [...caballosKeys.all, 'propietarios', id] as const,
  stats: (id: number) => [...caballosKeys.all, 'stats', id] as const,
  descendencia: (id: number) => [...caballosKeys.all, 'descendencia', id] as const,
  search: (query: string) => [...caballosKeys.all, 'search', query] as const,
  byEstablecimiento: (establecimientoId: number) => 
    [...caballosKeys.all, 'establecimiento', establecimientoId] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener lista de caballos con filtros y paginación
 * Cache: 2 minutos
 */
export function useCaballos(filters: CaballoFilters = {}, options: any = {}) {
  return useQuery({
    queryKey: caballosKeys.list(filters),
    queryFn: () => caballoService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
    ...options
  });
}

/**
 * Hook para obtener detalle de un caballo específico
 * Cache: 5 minutos
 */
export function useCaballo(id: number) {
  return useQuery({
    queryKey: caballosKeys.detail(id),
    queryFn: () => caballoService.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id,
  });
}

/**
 * Hook para obtener el pedigrí (árbol genealógico) de un caballo
 * Cache: 10 minutos (datos históricos, raramente cambian)
 */
export function usePedigree(id: number) {
  return useQuery({
    queryKey: caballosKeys.pedigree(id),
    queryFn: () => caballoService.getPedigree(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id,
  });
}

/**
 * Hook para obtener historial médico de un caballo
 * Cache: 3 minutos
 */
export function useHistorialMedico(id: number) {
  return useQuery({
    queryKey: caballosKeys.historialMedico(id),
    queryFn: () => caballoService.getHistorialMedico(id),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!id,
  });
}

/**
 * Hook para obtener propietarios de un caballo
 * Cache: 5 minutos
 */
export function usePropietarios(caballoId: number) {
  return useQuery({
    queryKey: caballosKeys.propietarios(caballoId),
    queryFn: () => caballoService.getPropietarios(caballoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener estadísticas de un caballo
 * Cache: 5 minutos
 */
export function useStadsCaballo(caballoId: number) {
  return useQuery({
    queryKey: caballosKeys.stats(caballoId),
    queryFn: () => caballoService.getStats(caballoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener descendencia (hijos/hijas) de un caballo
 * Cache: 10 minutos
 */
export function useDescendencia(caballoId: number) {
  return useQuery({
    queryKey: caballosKeys.descendencia(caballoId),
    queryFn: () => caballoService.getDescendencia(caballoId),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para buscar caballos por nombre
 * Cache: 2 minutos
 */
export function useBuscarCaballos(query: string, page = 1, limit = 10) {
  return useQuery({
    queryKey: caballosKeys.search(query),
    queryFn: () => caballoService.search(query, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: query.length >= 2, // Solo buscar si hay al menos 2 caracteres
  });
}

/**
 * Hook para obtener caballos de un establecimiento específico
 * Cache: 2 minutos
 */
export function useCaballosPorEstablecimiento(establecimientoId: number, page = 1, limit = 10) {
  return useQuery({
    queryKey: caballosKeys.byEstablecimiento(establecimientoId),
    queryFn: () => caballoService.getByEstablecimiento(establecimientoId, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !!establecimientoId,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un nuevo caballo
 * Invalida: lista de caballos, caballos por establecimiento
 */
export function useCrearCaballo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaballoData) => caballoService.create(data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: caballosKeys.lists() });
      
      // Si el caballo tiene establecimiento, invalidar esa lista también
      if (variables.establecimiento_id) {
        queryClient.invalidateQueries({ 
          queryKey: caballosKeys.byEstablecimiento(variables.establecimiento_id) 
        });
      }
      
      // Si tiene padre o madre, invalidar su descendencia
      if (variables.padre_id) {
        queryClient.invalidateQueries({ 
          queryKey: caballosKeys.descendencia(variables.padre_id) 
        });
      }
      if (variables.madre_id) {
        queryClient.invalidateQueries({ 
          queryKey: caballosKeys.descendencia(variables.madre_id) 
        });
      }
    },
  });
}

/**
 * Hook para actualizar un caballo existente
 * Invalida: caballo específico, lista de caballos, pedigrí si cambiaron padres
 */
export function useActualizarCaballo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCaballoData }) =>
      caballoService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: caballosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: caballosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: caballosKeys.stats(variables.id) });
      
      // Si cambiaron los padres, invalidar pedigrí
      if (variables.data.padre_id || variables.data.madre_id) {
        queryClient.invalidateQueries({ queryKey: caballosKeys.pedigree(variables.id) });
      }
    },
  });
}

/**
 * Hook para eliminar un caballo
 * Invalida: caballo específico, lista de caballos
 */
export function useEliminarCaballo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => caballoService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: caballosKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: caballosKeys.lists() });
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook para precargar datos de un caballo
 * Útil para optimizar navegación (ej: en hover sobre una tarjeta)
 */
export function usePrefetchCaballo() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: caballosKeys.detail(id),
      queryFn: () => caballoService.getById(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para precargar múltiples datos de un caballo en paralelo
 * Útil cuando se navega a la página de detalle
 */
export function usePrefetchCaballoCompleto() {
  const queryClient = useQueryClient();

  return (id: number) => {
    // Precargar en paralelo: detalle, pedigrí, historial médico, stats
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: caballosKeys.detail(id),
        queryFn: () => caballoService.getById(id),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: caballosKeys.pedigree(id),
        queryFn: () => caballoService.getPedigree(id),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: caballosKeys.historialMedico(id),
        queryFn: () => caballoService.getHistorialMedico(id),
        staleTime: 3 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: caballosKeys.stats(id),
        queryFn: () => caballoService.getStats(id),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  };
}

/**
 * Hook para invalidar manualmente todo el cache de caballos
 */
export function useInvalidateCaballos() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: caballosKeys.all });
  };
}

/**
 * Hook para invalidar datos de un caballo específico
 */
export function useInvalidateCaballo() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.invalidateQueries({ queryKey: caballosKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: caballosKeys.pedigree(id) });
    queryClient.invalidateQueries({ queryKey: caballosKeys.historialMedico(id) });
    queryClient.invalidateQueries({ queryKey: caballosKeys.propietarios(id) });
    queryClient.invalidateQueries({ queryKey: caballosKeys.stats(id) });
    queryClient.invalidateQueries({ queryKey: caballosKeys.descendencia(id) });
  };
}
