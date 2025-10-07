
'use client';

import { useState, useEffect } from 'react';
import { caballoService } from '@/lib/services/caballoService';
import { eventoService } from '@/lib/services/eventoService';
import { tareaService } from '@/lib/services/tareaService';
import { useAuthNew } from './useAuthNew';
import { logger } from '@/lib/utils/logger';

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
}

export function useStats() {
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const [stats, setStats] = useState<DashboardStats>({
    caballos: { total: 0, activos: 0, conEventos: 0, nuevos: 0 },
    eventos: { total: 0, urgentes: 0, programados: 0, completados: 0 },
    tareas: { total: 0, pendientes: 0, completadas: 0, enProgreso: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchStats();
    }
  }, [authLoading, isAuthenticated]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      if (authLoading || !isAuthenticated) return;
      
      // Fetch caballos stats
  const caballosResponse: any = await caballoService.getAll({ limit: 100 });
  const caballos = caballosResponse?.data?.caballos || caballosResponse?.caballos || caballosResponse?.data || caballosResponse || [];
  const caballosList = Array.isArray(caballos) ? caballos : [];
      
      const caballosStats = {
        total: caballosList.length,
        activos: caballosList.filter((c: any) => c.estado_global === 'activo').length,
        conEventos: caballosList.filter((c: any) => c._count?.eventos && c._count.eventos > 0).length,
        nuevos: caballosList.filter((c: any) => {
          const treintaDias = new Date();
          treintaDias.setDate(treintaDias.getDate() - 30);
          return new Date(c.creado_el) > treintaDias;
        }).length
      };

      // Fetch eventos stats
  const eventosResponse: any = await eventoService.getAll();
  const eventos = eventosResponse?.data || eventosResponse || [];
      
      const eventosStats = {
        total: eventos.length,
        urgentes: eventos.filter((e: any) => e.prioridad === 'critica' || e.prioridad === 'alta').length,
        programados: eventos.filter((e: any) => e.estado === 'pendiente').length,
        completados: eventos.filter((e: any) => e.estado === 'completado').length
      };

      // Fetch tareas stats
  const tareasResponse: any = await tareaService.getAll();
  const tareas = tareasResponse?.data || tareasResponse || [];
      
      const tareasStats = {
        total: tareas.length,
        pendientes: tareas.filter((t: any) => t.estado === 'pendiente').length,
        completadas: tareas.filter((t: any) => t.estado === 'completada').length,
        enProgreso: tareas.filter((t: any) => t.estado === 'en_progreso').length
      };

      setStats({
        caballos: caballosStats,
        eventos: eventosStats,
        tareas: tareasStats
      });
    } catch (error) {
  logger.error('Error fetching stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}