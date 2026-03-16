
'use client';

import { useQuery } from '@tanstack/react-query';
import { caballoService } from '@/lib/services/horseService';
import { eventoService } from '@/lib/services/eventService';
import { tareaService } from '@/lib/services/taskService';
import { establecimientoService } from '@/lib/services/stableService';
import { userService } from '@/lib/services/userService';
import { useAuthNew } from './useAuthNew';

export interface DashboardStats {
  caballos: {
    total: number;
    activos: number;
    conEventos: number;
    nuevos: number;
  };
  eventos: {
    total: number;
    urgentes: number;
    programados: number;
    completados: number;
  };
  tareas: {
    total: number;
    pendientes: number;
    completadas: number;
    enProgreso: number;
  };
  establecimientos?: {
    total: number;
    activos: number;
  };
  usuarios?: {
    total: number;
  };
}

const DEFAULT_STATS: DashboardStats = {
  caballos: { total: 0, activos: 0, conEventos: 0, nuevos: 0 },
  eventos: { total: 0, urgentes: 0, programados: 0, completados: 0 },
  tareas: { total: 0, pendientes: 0, completadas: 0, enProgreso: 0 },
};

function getTotal(response: any): number {
  return response?.data?.total ?? response?.total ?? response?.data?.caballos?.length ?? 0;
}

async function fetchAllStats(userRole: string): Promise<DashboardStats> {
  const isAdmin = userRole === 'admin';

  // Use limit:1 to get only the `total` count — no full data load
  const settled = await Promise.allSettled([
    caballoService.getAll({ page: 1, limit: 1 }),
    caballoService.getAll({ page: 1, limit: 1, estado: 'activo' }),
    eventoService.getAll({ page: 1, limit: 1 }),
    eventoService.getAll({ page: 1, limit: 1, estado: 'pendiente' }),
    eventoService.getAll({ page: 1, limit: 1, estado: 'completado' }),
    tareaService.getAll({ page: 1, limit: 1 }),
    tareaService.getAll({ page: 1, limit: 1, estado: 'pendiente' }),
    tareaService.getAll({ page: 1, limit: 1, estado: 'completada' }),
    tareaService.getAll({ page: 1, limit: 1, estado: 'en_progreso' }),
    isAdmin ? establecimientoService.getAll({ page: 1, limit: 1 }) : Promise.resolve(null),
    isAdmin ? userService.getAll({ page: 1, limit: 1 }) : Promise.resolve(null),
  ]);

  const get = (i: number) => settled[i].status === 'fulfilled' ? settled[i].value : null;

  return {
    caballos: {
      total: getTotal(get(0)),
      activos: getTotal(get(1)),
      conEventos: 0,
      nuevos: 0,
    },
    eventos: {
      total: getTotal(get(2)),
      urgentes: 0,
      programados: getTotal(get(3)),
      completados: getTotal(get(4)),
    },
    tareas: {
      total: getTotal(get(5)),
      pendientes: getTotal(get(6)),
      completadas: getTotal(get(7)),
      enProgreso: getTotal(get(8)),
    },
    establecimientos: isAdmin ? {
      total: getTotal(get(9)),
      activos: 0,
    } : { total: 0, activos: 0 },
    usuarios: isAdmin ? {
      total: getTotal(get(10)),
    } : undefined,
  };
}

export function useStats() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthNew();
  const userRole = user?.rol?.clave ?? '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stats', userRole],
    queryFn: () => fetchAllStats(userRole),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    enabled: !authLoading && isAuthenticated && !!userRole,
  });

  return {
    stats: data ?? DEFAULT_STATS,
    loading: isLoading,
    refetch,
  };
}
