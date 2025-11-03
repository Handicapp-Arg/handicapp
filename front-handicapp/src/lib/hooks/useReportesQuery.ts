/**
 * React Query Hooks para Reportes Médicos
 * 
 * Sistema de hooks para manejo de historial clínico, consultas, tratamientos,
 * vacunaciones y reportes médicos completos con cache automático.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  reportesMedicosService,
  type FiltrosReporte,
} from '../reportesMedicosService';

// ==================== QUERY KEYS ====================

export const reportesKeys = {
  all: ['reportes-medicos'] as const,
  historialClinico: (caballoId: number) => 
    [...reportesKeys.all, 'historial', caballoId] as const,
  reporteCompleto: (caballoId: number) => 
    [...reportesKeys.all, 'completo', caballoId] as const,
  reportesFiltrados: (filtros: FiltrosReporte) =>
    [...reportesKeys.all, 'filtrados', filtros] as const,
  consultas: (caballoId: number) =>
    [...reportesKeys.all, 'consultas', caballoId] as const,
  tratamientos: (caballoId: number) =>
    [...reportesKeys.all, 'tratamientos', caballoId] as const,
  vacunaciones: (caballoId: number) =>
    [...reportesKeys.all, 'vacunaciones', caballoId] as const,
  diagnosticos: (caballoId: number) =>
    [...reportesKeys.all, 'diagnosticos', caballoId] as const,
  cirugias: (caballoId: number) =>
    [...reportesKeys.all, 'cirugias', caballoId] as const,
  examenes: (caballoId: number) =>
    [...reportesKeys.all, 'examenes', caballoId] as const,
};

// ==================== QUERY HOOKS ====================

/**
 * Hook para obtener historial clínico completo de un caballo
 * Cache: 5 minutos
 */
export function useHistorialClinico(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.historialClinico(caballoId),
    queryFn: () => reportesMedicosService.getHistorialClinico(caballoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener reporte médico completo con resumen
 * Cache: 5 minutos
 */
export function useReporteMedicoCompleto(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.reporteCompleto(caballoId),
    queryFn: () => reportesMedicosService.getReporteMedicoCompleto(caballoId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener reportes con filtros específicos
 * Cache: 3 minutos
 */
export function useReportesFiltrados(filtros: FiltrosReporte) {
  return useQuery({
    queryKey: reportesKeys.reportesFiltrados(filtros),
    queryFn: () => reportesMedicosService.getReportesFiltrados(filtros),
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!filtros.caballo_id || !!filtros.fecha_desde,
  });
}

/**
 * Hook para obtener solo consultas de un caballo
 * Cache: 5 minutos
 */
export function useConsultas(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.consultas(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.consultas;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener solo tratamientos de un caballo
 * Cache: 3 minutos (pueden cambiar frecuentemente)
 */
export function useTratamientos(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.tratamientos(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.tratamientos;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener solo vacunaciones de un caballo
 * Cache: 10 minutos (cambian poco)
 */
export function useVacunaciones(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.vacunaciones(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.vacunaciones;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener solo diagnósticos de un caballo
 * Cache: 5 minutos
 */
export function useDiagnosticos(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.diagnosticos(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.diagnosticos;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener solo cirugías de un caballo
 * Cache: 10 minutos (históricas, raramente cambian)
 */
export function useCirugias(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.cirugias(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.cirugias;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!caballoId,
  });
}

/**
 * Hook para obtener solo exámenes de un caballo
 * Cache: 5 minutos
 */
export function useExamenes(caballoId: number) {
  return useQuery({
    queryKey: reportesKeys.examenes(caballoId),
    queryFn: async () => {
      const historial = await reportesMedicosService.getHistorialClinico(caballoId);
      return historial.examenes;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!caballoId,
  });
}

// ==================== MUTATION HOOKS ====================

/**
 * Hook para generar PDF de reporte médico
 * No invalida cache (es solo una exportación)
 */
export function useGenerarPDFReporte() {
  return useMutation({
    mutationFn: (caballoId: number) => 
      reportesMedicosService.generarPDFReporte(caballoId),
  });
}

/**
 * Hook para refrescar historial clínico después de una actualización
 * Útil después de agregar consultas, tratamientos, etc desde otros módulos
 */
export function useRefreshHistorialClinico() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (caballoId: number) => {
      await queryClient.invalidateQueries({ 
        queryKey: reportesKeys.historialClinico(caballoId) 
      });
      await queryClient.invalidateQueries({ 
        queryKey: reportesKeys.reporteCompleto(caballoId) 
      });
      return true;
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook para precargar historial clínico de un caballo
 * Útil para optimizar navegación (ej: en hover sobre tarjeta de caballo)
 */
export function usePrefetchHistorialClinico() {
  const queryClient = useQueryClient();

  return (caballoId: number) => {
    queryClient.prefetchQuery({
      queryKey: reportesKeys.historialClinico(caballoId),
      queryFn: () => reportesMedicosService.getHistorialClinico(caballoId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para precargar reporte completo de un caballo
 */
export function usePrefetchReporteCompleto() {
  const queryClient = useQueryClient();

  return (caballoId: number) => {
    queryClient.prefetchQuery({
      queryKey: reportesKeys.reporteCompleto(caballoId),
      queryFn: () => reportesMedicosService.getReporteMedicoCompleto(caballoId),
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * Hook para invalidar manualmente todo el cache de reportes médicos
 */
export function useInvalidateReportes() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: reportesKeys.all });
  };
}

/**
 * Hook para invalidar reportes de un caballo específico
 */
export function useInvalidateReportesCaballo() {
  const queryClient = useQueryClient();

  return (caballoId: number) => {
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.historialClinico(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.reporteCompleto(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.consultas(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.tratamientos(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.vacunaciones(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.diagnosticos(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.cirugias(caballoId) 
    });
    queryClient.invalidateQueries({ 
      queryKey: reportesKeys.examenes(caballoId) 
    });
  };
}
