/**
 * React Query Hooks para Gestión de Personal
 * 
 * Sistema de hooks para manejo de empleados, horarios, turnos y ausencias
 * con cache automático y optimización de performance.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  gestionPersonalService,
  type CrearEmpleadoDTO,
  type ActualizarEmpleadoDTO,
  type Turno,
  type Ausencia,
  type FiltrosEmpleados,
} from '../gestionPersonalService';

// ==================== QUERY KEYS ====================

export const personalKeys = {
  all: ['personal'] as const,
  empleados: () => [...personalKeys.all, 'empleados'] as const,
  empleado: (id: number) => [...personalKeys.empleados(), id] as const,
  empleadosFiltrados: (filtros: FiltrosEmpleados) => 
    [...personalKeys.empleados(), 'filtrados', filtros] as const,
  horarios: () => [...personalKeys.all, 'horarios'] as const,
  turnos: () => [...personalKeys.all, 'turnos'] as const,
  turnosFiltrados: (filtros: { fecha?: string; empleadoId?: number }) =>
    [...personalKeys.turnos(), 'filtrados', filtros] as const,
  ausencias: () => [...personalKeys.all, 'ausencias'] as const,
  ausenciasFiltradas: (filtros: { empleadoId?: number; pendientes?: boolean }) =>
    [...personalKeys.ausencias(), 'filtradas', filtros] as const,
  historialLaboral: (empleadoId: number) => 
    [...personalKeys.all, 'historial', empleadoId] as const,
  estadisticas: () => [...personalKeys.all, 'estadisticas'] as const,
  empleadosPorRol: () => [...personalKeys.all, 'empleados-por-rol'] as const,
  empleadosPorDepartamento: () => 
    [...personalKeys.all, 'empleados-por-departamento'] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener lista de empleados con filtros opcionales
 * Cache: 2 minutos
 */
export function useEmpleados(filtros?: FiltrosEmpleados) {
  return useQuery({
    queryKey: filtros 
      ? personalKeys.empleadosFiltrados(filtros)
      : personalKeys.empleados(),
    queryFn: () => gestionPersonalService.getEmpleados(filtros),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener detalle de un empleado específico
 * Cache: 5 minutos
 */
export function useEmpleado(id: number) {
  return useQuery({
    queryKey: personalKeys.empleado(id),
    queryFn: () => gestionPersonalService.getEmpleado(id),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!id,
  });
}

/**
 * Hook para obtener lista de horarios
 * Cache: 10 minutos (raramente cambian)
 */
export function useHorarios() {
  return useQuery({
    queryKey: personalKeys.horarios(),
    queryFn: () => gestionPersonalService.getHorarios(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener turnos con filtros opcionales
 * Cache: 1 minuto (datos dinámicos)
 */
export function useTurnos(filtros?: { fecha?: string; empleadoId?: number }) {
  return useQuery({
    queryKey: filtros 
      ? personalKeys.turnosFiltrados(filtros)
      : personalKeys.turnos(),
    queryFn: () => gestionPersonalService.getTurnos(filtros?.fecha, filtros?.empleadoId),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
}

/**
 * Hook para obtener ausencias con filtros opcionales
 * Cache: 2 minutos
 */
export function useAusencias(filtros?: { empleadoId?: number; pendientes?: boolean }) {
  return useQuery({
    queryKey: filtros 
      ? personalKeys.ausenciasFiltradas(filtros)
      : personalKeys.ausencias(),
    queryFn: () => gestionPersonalService.getAusencias(filtros?.empleadoId, filtros?.pendientes),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener historial laboral de un empleado
 * Cache: 5 minutos
 */
export function useHistorialLaboral(empleadoId: number) {
  return useQuery({
    queryKey: personalKeys.historialLaboral(empleadoId),
    queryFn: () => gestionPersonalService.getHistorialLaboral(empleadoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!empleadoId,
  });
}

/**
 * Hook para obtener estadísticas generales de personal
 * Cache: 3 minutos
 */
export function useEstadisticasPersonal() {
  return useQuery({
    queryKey: personalKeys.estadisticas(),
    queryFn: () => gestionPersonalService.getEstadisticasPersonal(),
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

/**
 * Hook para obtener distribución de empleados por rol
 * Cache: 5 minutos
 */
export function useEmpleadosPorRol() {
  return useQuery({
    queryKey: personalKeys.empleadosPorRol(),
    queryFn: () => gestionPersonalService.getEmpleadosPorRol(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener distribución de empleados por departamento
 * Cache: 5 minutos
 */
export function useEmpleadosPorDepartamento() {
  return useQuery({
    queryKey: personalKeys.empleadosPorDepartamento(),
    queryFn: () => gestionPersonalService.getEmpleadosPorDepartamento(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para crear un nuevo empleado
 * Invalida: empleados, estadísticas, empleados por rol y departamento
 */
export function useCrearEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearEmpleadoDTO) => 
      gestionPersonalService.crearEmpleado(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorRol() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorDepartamento() });
    },
  });
}

/**
 * Hook para actualizar un empleado existente
 * Invalida: empleado específico, lista de empleados, estadísticas
 */
export function useActualizarEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ActualizarEmpleadoDTO }) =>
      gestionPersonalService.actualizarEmpleado(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalKeys.empleado(variables.id) });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorRol() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorDepartamento() });
    },
  });
}

/**
 * Hook para eliminar un empleado
 * Invalida: empleado específico, lista de empleados, estadísticas
 */
export function useEliminarEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => gestionPersonalService.eliminarEmpleado(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: personalKeys.empleado(id) });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorRol() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleadosPorDepartamento() });
    },
  });
}

/**
 * Hook para cambiar el estado de un empleado
 * Invalida: empleado específico, lista de empleados, estadísticas
 */
export function useCambiarEstadoEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      gestionPersonalService.cambiarEstadoEmpleado(id, estado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalKeys.empleado(variables.id) });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
    },
  });
}

/**
 * Hook para asignar horario a un empleado
 * Invalida: empleado específico, lista de empleados
 */
export function useAsignarHorario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empleadoId, horarioId }: { empleadoId: number; horarioId: number }) =>
      gestionPersonalService.asignarHorario(empleadoId, horarioId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: personalKeys.empleado(variables.empleadoId) });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
    },
  });
}

/**
 * Hook para crear un turno
 * Invalida: turnos
 */
export function useCrearTurno() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (turnoData: Partial<Turno>) => 
      gestionPersonalService.crearTurno(turnoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalKeys.turnos() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
    },
  });
}

/**
 * Hook para solicitar ausencia
 * Invalida: ausencias, estadísticas
 */
export function useSolicitarAusencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ausenciaData: Partial<Ausencia>) =>
      gestionPersonalService.solicitarAusencia(ausenciaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalKeys.ausencias() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
    },
  });
}

/**
 * Hook para aprobar/rechazar ausencia
 * Invalida: ausencias, estadísticas, empleado específico
 */
export function useAprobarAusencia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ausenciaId, aprobada }: { ausenciaId: number; aprobada: boolean }) =>
      gestionPersonalService.aprobarAusencia(ausenciaId, aprobada),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personalKeys.ausencias() });
      queryClient.invalidateQueries({ queryKey: personalKeys.estadisticas() });
      queryClient.invalidateQueries({ queryKey: personalKeys.empleados() });
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook para precargar datos de un empleado
 * Útil para optimizar navegación (ej: en hover sobre una tarjeta)
 */
export function usePrefetchEmpleado() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: personalKeys.empleado(id),
      queryFn: () => gestionPersonalService.getEmpleado(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente todo el cache de personal
 */
export function useInvalidatePersonal() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: personalKeys.all });
  };
}
