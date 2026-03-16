import { useQuery } from '@tanstack/react-query';
import ApiClient from '../services/apiClient';

interface HorseSummary {
  id: number;
  nombre: string;
  foto_url?: string;
  estado_global?: string;
}

interface TareaSummary {
  id: number;
  titulo: string;
  estado: string;
  prioridad?: string;
}

interface EventoSummary {
  id: number;
  titulo?: string;
  tipo?: string;
  fecha?: string;
  estado?: string;
}

export interface PropietarioDashboardData {
  gastosStats: {
    mesActual: number;
    mesAnterior: number;
    diferencia: number;
    tipo: 'aumento' | 'disminucion';
  };
  caballos: HorseSummary[];
  tareas: TareaSummary[];
  eventos: EventoSummary[];
}

export function useOwnerDashboard() {
  return useQuery<PropietarioDashboardData>({
    queryKey: ['propietario', 'dashboard'],
    queryFn: async () => {
      const res = await ApiClient.makeRequest<{ success: boolean; data: PropietarioDashboardData }>('/propietario/dashboard');
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
