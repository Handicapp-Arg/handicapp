/**
 * React Query Hooks para Usuarios
 * 
 * Sistema de hooks para gestión de usuarios con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type User } from '../services/userService';

// ==================== QUERY KEYS ====================

export const usuariosKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...usuariosKeys.lists(), filters] as const,
  details: () => [...usuariosKeys.all, 'detail'] as const,
  detail: (id: number) => [...usuariosKeys.details(), id] as const,
  current: () => [...usuariosKeys.all, 'current'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener todos los usuarios
 * Cache: 5 minutos
 */
export function useUsuarios(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: usuariosKeys.list(filters),
    queryFn: () => userService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener un usuario específico
 * Cache: 10 minutos
 */
export function useUsuario(id: number) {
  return useQuery({
    queryKey: usuariosKeys.detail(id),
    queryFn: () => userService.getById(id),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!id && id > 0,
  });
}

/**
 * Hook para obtener el usuario actual (autenticado)
 * Cache: 15 minutos
 * 
 * NOTA: Actualmente comentado porque userService no tiene getCurrentUser()
 * Usar AuthManager.getInstance().getState().user en su lugar
 */
export function useUsuarioActual() {
  return useQuery({
    queryKey: usuariosKeys.current(),
    queryFn: async () => {
      // TODO: Implementar getCurrentUser en userService
      // Por ahora retorna null
      return null;
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    enabled: false, // Deshabilitado hasta implementar el método
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un nuevo usuario
 * 
 * NOTA: Requiere CreateUserData completo (con password y rol_id)
 */
export function useCrearUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<User> & { password?: string; rol_id?: number }) => 
      userService.create(data as Parameters<typeof userService.create>[0]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar un usuario
 */
export function useActualizarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => 
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.current() });
    },
  });
}

/**
 * Hook para eliminar un usuario
 */
export function useEliminarUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
    },
  });
}

/**
 * Hook para actualizar el rol de un usuario
 * 
 * NOTA: userService no tiene updateRole(), usa update() como workaround
 */
export function useActualizarRolUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rolId }: { id: number; rolId: number }) => {
      // TODO: Implementar updateRole en userService
      // Por ahora usa update con el rol_id
      return userService.update(id, { rol_id: rolId } as Parameters<typeof userService.update>[1]);
    },
    onSuccess: (_data: User, variables: { id: number; rolId: number }) => {
      queryClient.invalidateQueries({ queryKey: usuariosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usuariosKeys.detail(variables.id) });
    },
  });
}
