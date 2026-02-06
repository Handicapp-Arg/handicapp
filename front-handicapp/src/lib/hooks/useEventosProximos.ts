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

        // Filtrar y ordenar eventos futuros (incluyendo hoy)
        const eventosFuturos = (response.data || [])
          .filter((evento: EventoProximo) => {
            // Convertir fechas a objetos Date para comparación segura
            const fechaEvento = new Date(evento.fecha_evento);
            const hoy = new Date();
            // Resetear horas para comparar solo fechas (incluir todo el día de hoy)
            hoy.setHours(0, 0, 0, 0);
            
            // Si el evento tiene hora específica, usémosla, pero si es >= hoy 00:00, entra.
            // Sin embargo, para eventos pasados de hoy (ej: ayer 23:00) debería haber filtrado el backend.
            // Para eventos 'de hoy' ya pasados por hora, generalmente queremos verlos igual en "Próximos" si es agenda del día.
            
            // Comparación simple de fechas (ignorando hora para inclusion)
            // Aseguramos que la fecha del evento sea al menos hoy (dia calendario)
            const eventoDate = new Date(fechaEvento);
            eventoDate.setHours(0,0,0,0);
            
            return eventoDate.getTime() >= hoy.getTime();
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
