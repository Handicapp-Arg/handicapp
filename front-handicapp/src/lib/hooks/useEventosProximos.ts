/**
 * Hook para obtener eventos próximos del usuario
 * Reutilizable en todos los dashboards
 */

import { useEffect, useState } from 'react';
import { eventoService } from '@/lib/services/eventoService';

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

interface UseEventosProximosOptions {
  limit?: number;
  enabled?: boolean;
}

export function useEventosProximos(options: UseEventosProximosOptions = {}) {
  const { limit = 5, enabled = true } = options;
  const [eventos, setEventos] = useState<EventoProximo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchEventos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener eventos próximos (ordenados por fecha)
        const today = new Date().toISOString().split('T')[0];
        const response = await eventoService.getAll({
          page: 1,
          limit,
          fecha_desde: today,
        });

        // Filtrar y ordenar eventos futuros
        const eventosFuturos = (response.data || [])
          .filter((evento: EventoProximo) => {
            const fechaEvento = new Date(evento.fecha_evento);
            return fechaEvento >= new Date();
          })
          .sort((a: EventoProximo, b: EventoProximo) => {
            return new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime();
          })
          .slice(0, limit);

        setEventos(eventosFuturos);
      } catch (err) {
        console.error('Error fetching eventos próximos:', err);
        setError('Error al cargar eventos');
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [limit, enabled]);

  return { eventos, loading, error };
}
