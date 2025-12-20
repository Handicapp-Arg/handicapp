/**
 * 🚀 HOOK OPTIMIZADO PARA EVENTOS PRÓXIMOS
 * Cache inteligente y fetch mínimo
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { httpJson } from '@/lib/http';
import { useAuthNew } from './useAuthNew';

export interface EventoProximo {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  tipo: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  caballo?: {
    id: number;
    nombre: string;
  };
  establecimiento?: {
    id: number;
    nombre: string;
  };
}

export interface EventosProximosParams {
  limit?: number;
  dias?: number; // Próximos X días
}

/**
 * Hook optimizado para eventos próximos
 * - Cache de 2 minutos
 * - Prefetch inteligente
 * - Queries separadas por límite para mejor cache hit
 */
export function useEventosProximosOptimized(params: EventosProximosParams = {}) {
  const { isAuthenticated } = useAuthNew();
  const { limit = 5, dias = 7 } = params;

  return useQuery({
    queryKey: ['eventos-proximos', limit, dias],
    queryFn: async () => {
      const response = await httpJson<{ eventos: EventoProximo[] }>(`/eventos/proximos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Filtrar y ordenar en cliente para optimizar
      const eventosOrdenados = response.eventos
        .filter(evento => {
          const fechaEvento = new Date(evento.fecha_evento);
          const ahora = new Date();
          const limiteFecha = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000);
          return fechaEvento >= ahora && fechaEvento <= limiteFecha;
        })
        .sort((a, b) => new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime())
        .slice(0, limit);

      return { eventos: eventosOrdenados };
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,        // 2 minutos - eventos cambian poco
    gcTime: 5 * 60 * 1000,           // 5 minutos en cache
    refetchOnWindowFocus: false,      // No refetch en focus
    refetchInterval: 5 * 60 * 1000,   // Auto-refetch cada 5 min (solo si está activo)
  });
}

/**
 * Hook legacy para migración gradual
 * @deprecated Usar useEventosProximosOptimized
 */
export function useEventosProximos(params: EventosProximosParams = {}) {
  console.warn('🚨 useEventosProximos is deprecated. Use useEventosProximosOptimized for better performance');
  
  const { data, isLoading, error } = useEventosProximosOptimized(params);
  
  return {
    eventos: data?.eventos || [],
    loading: isLoading,
    error
  };
}