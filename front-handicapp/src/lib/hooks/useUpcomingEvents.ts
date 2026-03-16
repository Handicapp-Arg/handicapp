/**
 * Hook para obtener eventos próximos del usuario
 * Reutilizable en todos los dashboards
 */

import { useQuery } from '@tanstack/react-query';
import { eventoService } from '@/lib/services/eventService';

interface EventoProximo {
  id: number;
  titulo: string;
  fecha_evento: string;
  hora_inicio?: string;
  hora_fin?: string;
  ubicacion?: string;
  tipo_evento?: {
    nombre: string;
  };
}

interface UseUpcomingEventsOptions {
  limit?: number;
  enabled?: boolean;
}

export function useUpcomingEvents(options: UseUpcomingEventsOptions = {}) {
  const { limit = 5, enabled = true } = options;
  const today = new Date().toISOString().split('T')[0];

  const { data, isLoading, error } = useQuery({
    queryKey: ['eventos', 'proximos', { limit, today }],
    queryFn: () => eventoService.getAll({ page: 1, limit, fecha_desde: today }),
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled,
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const eventos: EventoProximo[] = (data?.data || [])
    .filter((evento: EventoProximo) => {
      const eventoDate = new Date(evento.fecha_evento);
      eventoDate.setHours(0, 0, 0, 0);
      return eventoDate.getTime() >= hoy.getTime();
    })
    .sort((a: EventoProximo, b: EventoProximo) =>
      new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime()
    )
    .slice(0, limit);

  return {
    eventos,
    loading: isLoading,
    error: error ? 'Error al cargar eventos' : null,
  };
}
