/**
 * React Query Hooks para Gestión de Tareas
 * 
 * Sistema de hooks para manejo de tareas, asignaciones, completado
 * y estadísticas con cache automático y optimización de performance.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  tareaService,
  type CreateTareaData,
  type TareaFilters,
} from '../services/taskService';

// ==================== QUERY KEYS ====================

export const tareasKeys = {
  all: ['tareas'] as const,
  lists: () => [...tareasKeys.all, 'list'] as const,
  list: (filters: TareaFilters) => [...tareasKeys.lists(), filters] as const,
  details: () => [...tareasKeys.all, 'detail'] as const,
  detail: (id: number) => [...tareasKeys.details(), id] as const,
  stats: () => [...tareasKeys.all, 'stats'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener lista de tareas con filtros y paginación
 * Cache: 1 minuto (datos dinámicos)
 */
export function useTareas(filters: TareaFilters = {}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tareasKeys.list(filters),
    queryFn: () => tareaService.getAll(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook para obtener detalle de una tarea específica
 * Cache: 3 minutos
 */
export function useTarea(id: number) {
  return useQuery({
    queryKey: tareasKeys.detail(id),
    queryFn: () => tareaService.getById(id),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!id,
  });
}

/**
 * Hook para obtener tareas pendientes (filtro común)
 * Cache: 1 minuto
 */
export function useTareasPendientes() {
  return useTareas({ estado: 'pendiente' });
}

/**
 * Hook para obtener tareas en progreso (filtro común)
 * Cache: 1 minuto
 */
export function useTareasEnProgreso() {
  return useTareas({ estado: 'en_progreso' });
}

/**
 * Hook para obtener tareas completadas (filtro común)
 * Cache: 5 minutos (menos dinámicas)
 */
export function useTareasCompletadas(filtros: Omit<TareaFilters, 'estado'> = {}) {
  return useQuery({
    queryKey: tareasKeys.list({ ...filtros, estado: 'completada' }),
    queryFn: () => tareaService.getAll({ ...filtros, estado: 'completada' }),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener tareas de alta prioridad
 * Cache: 30 segundos (críticas)
 */
export function useTareasAltaPrioridad() {
  return useQuery({
    queryKey: tareasKeys.list({ prioridad: 'alta' }),
    queryFn: () => tareaService.getAll({ prioridad: 'alta' }),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // Auto-refetch cada 2 minutos
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear una nueva tarea
 * Invalida: lista de tareas, estadísticas, tareas vencidas
 */
export function useCrearTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTareaData) => tareaService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
      
      // Si se asignó a un usuario, invalidar las listas
      if (variables.asignado_a_usuario_id) {
        queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      }
    },
  });
}

/**
 * Hook para actualizar una tarea existente
 * Invalida: tarea específica, lista de tareas, estadísticas
 */
export function useActualizarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateTareaData> }) =>
      tareaService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
    },
  });
}

/**
 * Hook para eliminar una tarea
 * Invalida: tarea específica, lista de tareas, estadísticas
 */
export function useEliminarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tareaService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
    },
  });
}

/**
 * Hook para asignar una tarea a un usuario
 * Invalida: tarea específica, lista de tareas, tareas del usuario
 */
export function useAsignarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usuarioId }: { id: number; usuarioId: number }) =>
      tareaService.assign(id, usuarioId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
    },
  });
}

/**
 * Hook para completar una tarea
 * Invalida: tarea específica, todas las listas, estadísticas, productividad
 */
export function useCompletarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      observaciones, 
      tiempoRealMinutos 
    }: { 
      id: number; 
      observaciones?: string; 
      tiempoRealMinutos?: number;
    }) => tareaService.complete(id, observaciones, tiempoRealMinutos),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
    },
  });
}

/**
 * Hook para cancelar una tarea
 * Invalida: tarea específica, listas, estadísticas
 */
export function useCancelarTarea() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; motivo?: string }) =>
      tareaService.cancel(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tareasKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook para precargar datos de una tarea
 * Útil para optimizar navegación (ej: en hover sobre tarjeta de tarea)
 */
export function usePrefetchTarea() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: tareasKeys.detail(id),
      queryFn: () => tareaService.getById(id),
      staleTime: 3 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente todo el cache de tareas
 */
export function useInvalidateTareas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tareasKeys.all });
  };
}

/**
 * Hook para invalidar estadísticas y productividad
 * Útil después de acciones masivas
 */
export function useInvalidateEstadisticasTareas() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tareasKeys.stats() });
  };
}
