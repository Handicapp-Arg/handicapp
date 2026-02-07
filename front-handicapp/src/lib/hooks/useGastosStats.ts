import { useQuery } from '@tanstack/react-query';
import { gastoService, GastosStats } from '../services/gastoService';

export function useGastosStats() {
  return useQuery<GastosStats>({
    queryKey: ['gastos', 'stats'],
    queryFn: () => gastoService.getStats(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
