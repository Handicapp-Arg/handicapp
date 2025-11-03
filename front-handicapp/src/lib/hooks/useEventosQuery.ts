/**
 * React Query Hooks para Gestión de Eventos
 * 
 * Sistema de hooks para manejo de eventos con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  eventoService,
  type Evento,
} from '../services/eventoService';

// ==================== QUERY KEYS ====================

export const eventosKeys = {
  all: ['eventos'] as const,
  lists: () => [...eventosKeys.all, 'list'] as const,
  list: (filters?: any) => [...eventosKeys.lists(), filters] as const,
  details: () => [...eventosKeys.all, 'detail'] as const,
  detail: (id: number) => [...eventosKeys.details(), id] as const,
  upcoming: (params?: any) => [...eventosKeys.all, 'upcoming', params] as const,
  byCaballo: (caballoId: number) => [...eventosKeys.all, 'caballo', caballoId] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener todos los eventos
 * Cache: 2 minutos
 */
export function useEventos(filters?: any) {
  return useQuery({
    queryKey: eventosKeys.list(filters),
    queryFn: () => eventoService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener próximos eventos
 * Cache: 1 minuto (datos más dinámicos)
 */
export function useEventosUpcoming(params?: { limit?: number }) {
  return useQuery({
    queryKey: eventosKeys.upcoming(params),
    queryFn: () => eventoService.getUpcoming(params || {}),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener detalle de un evento
 * Cache: 5 minutos
 */
export function useEvento(id: number) {
  return useQuery({
    queryKey: eventosKeys.detail(id),
    queryFn: () => eventoService.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id && id > 0,
  });
}

/**
 * Hook para obtener eventos de un caballo específico
 * Cache: 3 minutos
 */
export function useEventosByCaballo(caballoId: number) {
  return useQuery({
    queryKey: eventosKeys.byCaballo(caballoId),
    queryFn: () => eventoService.getAll({ caballo_id: caballoId }),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!caballoId && caballoId > 0,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un nuevo evento
 */
export function useCreateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => eventoService.create(data),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: eventosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventosKeys.upcoming() });
    },
  });
}

/**
 * Hook para actualizar un evento
 */
export function useUpdateEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      eventoService.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: eventosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: eventosKeys.upcoming() });
    },
  });
}

/**
 * Hook para eliminar un evento
 */
export function useDeleteEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => eventoService.delete(id),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: eventosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventosKeys.upcoming() });
    },
  });
}
