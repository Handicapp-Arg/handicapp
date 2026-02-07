import { useQuery } from '@tanstack/react-query';
import ApiClient from '../services/apiClient';

export interface PropietarioDashboardData {
  gastosStats: {
    mesActual: number;
    mesAnterior: number;
    diferencia: number;
    tipo: 'aumento' | 'disminucion';
  };
  caballos: any[];
  tareas: any[];
  eventos: any[];
}

export function usePropietarioDashboard() {
  return useQuery<PropietarioDashboardData>({
    queryKey: ['propietario', 'dashboard'],
    queryFn: async () => {
      const response: any = await (ApiClient as any).request('/propietario/dashboard');
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
