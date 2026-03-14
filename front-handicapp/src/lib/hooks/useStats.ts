
'use client';

import { useQuery } from '@tanstack/react-query';
import { caballoService } from '@/lib/services/caballoService';
import { eventoService } from '@/lib/services/eventoService';
import { tareaService } from '@/lib/services/tareaService';
import { gestionPersonalService } from '@/lib/gestionPersonalService';
import { inventarioService } from '@/lib/inventarioService';
import { establecimientoService } from '@/lib/services/establecimientoService';
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
  empleados?: {
    total: number;
    activos: number;
    departamentos: number;
    nuevos: number;
  };
  inventario?: {
    total: number;
    stockBajo: number;
    categorias: number;
    valorTotal: number;
  };
  establecimientos?: {
    total: number;
    activos: number;
  };
}

const DEFAULT_STATS: DashboardStats = {
  caballos: { total: 0, activos: 0, conEventos: 0, nuevos: 0 },
  eventos: { total: 0, urgentes: 0, programados: 0, completados: 0 },
  tareas: { total: 0, pendientes: 0, completadas: 0, enProgreso: 0 },
  empleados: { total: 0, activos: 0, departamentos: 0, nuevos: 0 },
  inventario: { total: 0, stockBajo: 0, categorias: 0, valorTotal: 0 },
};

async function fetchAllStats(userRole: string): Promise<DashboardStats> {
  const shouldFetchEmpleados = ['admin', 'capataz', 'establecimiento'].includes(userRole);
  const shouldFetchInventario = userRole === 'establecimiento';
  const isAdmin = userRole === 'admin';

  const promises: Record<string, Promise<any>> = {
    caballos: caballoService.getAll({ limit: 100 }),
    eventos: eventoService.getAll(),
    tareas: tareaService.getAll(),
    empleados: shouldFetchEmpleados ? gestionPersonalService.getEmpleados() : Promise.resolve(null),
    inventario: shouldFetchInventario ? inventarioService.getProductos() : Promise.resolve(null),
    establecimientos: isAdmin ? establecimientoService.getAll({ limit: 100 }) : Promise.resolve(null),
  };

  const entries = Object.entries(promises);
  const settled = await Promise.allSettled(entries.map(([, p]) => p));

  const resolved: Record<string, any> = {};
  entries.forEach(([key], i) => {
    const result = settled[i];
    resolved[key] = result.status === 'fulfilled' ? result.value : null;
  });

  // Caballos — backend retorna { success, data: { caballos: [], total, page } }
  const caballosResponse: any = resolved.caballos;
  const caballosRaw = caballosResponse?.data?.caballos ?? caballosResponse?.data ?? caballosResponse ?? [];
  const caballosList = Array.isArray(caballosRaw) ? caballosRaw : [];
  const treintaDias = new Date();
  treintaDias.setDate(treintaDias.getDate() - 30);

  const caballosStats = {
    total: caballosList.length,
    activos: caballosList.filter((c: any) => c.estado_global === 'activo').length,
    conEventos: caballosList.filter((c: any) => c._count?.eventos && c._count.eventos > 0).length,
    nuevos: caballosList.filter((c: any) => new Date(c.creado_el) > treintaDias).length,
  };

  // Eventos — backend retorna { success, data: Evento[], meta: {...} }
  const eventosResponse: any = resolved.eventos;
  const eventosRaw = eventosResponse?.data ?? eventosResponse ?? [];
  const eventos = Array.isArray(eventosRaw) ? eventosRaw : [];
  const eventosStats = {
    total: eventos.length,
    urgentes: eventos.filter((e: any) => e.prioridad === 'critica' || e.prioridad === 'alta').length,
    programados: eventos.filter((e: any) => e.estado === 'pendiente').length,
    completados: eventos.filter((e: any) => e.estado === 'completado').length,
  };

  // Tareas — backend retorna { success, data: Tarea[], meta: {...} }
  const tareasResponse: any = resolved.tareas;
  const tareasRaw = tareasResponse?.data ?? tareasResponse ?? [];
  const tareas = Array.isArray(tareasRaw) ? tareasRaw : [];
  const tareasStats = {
    total: tareas.length,
    pendientes: tareas.filter((t: any) => t.estado === 'pendiente').length,
    completadas: tareas.filter((t: any) => t.estado === 'completada').length,
    enProgreso: tareas.filter((t: any) => t.estado === 'en_progreso').length,
  };

  // Empleados
  let empleadosStats = { total: 0, activos: 0, departamentos: 0, nuevos: 0 };
  if (shouldFetchEmpleados && Array.isArray(resolved.empleados)) {
    const empleados = resolved.empleados;
    const deptosUnicos = new Set(empleados.map((e: any) => e.departamento).filter(Boolean));
    empleadosStats = {
      total: empleados.length,
      activos: empleados.filter((e: any) => e.estado === 'activo').length,
      departamentos: deptosUnicos.size,
      nuevos: empleados.filter((e: any) => {
        const fecha = e.fecha_ingreso || e.creado_el || e.created_at;
        return fecha && new Date(fecha) > treintaDias;
      }).length,
    };
  }

  // Inventario
  let inventarioStats = { total: 0, stockBajo: 0, categorias: 0, valorTotal: 0 };
  if (shouldFetchInventario && Array.isArray(resolved.inventario)) {
    const productos = resolved.inventario;
    const categoriasUnicas = new Set(productos.map((p: any) => p.categoria_id));
    const valorTotal = productos.reduce((sum: number, p: any) => sum + (p.stock_actual * p.precio_unitario), 0);
    inventarioStats = {
      total: productos.length,
      stockBajo: productos.filter((p: any) => p.stock_actual < p.stock_minimo).length,
      categorias: categoriasUnicas.size,
      valorTotal: Math.round(valorTotal),
    };
  }

  // Establecimientos
  let establecimientosStats = { total: 0, activos: 0 };
  if (isAdmin && resolved.establecimientos) {
    const establecimientosData = resolved.establecimientos?.items || resolved.establecimientos?.data || [];
    establecimientosStats = {
      total: establecimientosData.length,
      activos: establecimientosData.filter((e: any) => e.estado === 'activo').length,
    };
  }

  return {
    caballos: caballosStats,
    eventos: eventosStats,
    tareas: tareasStats,
    empleados: empleadosStats,
    inventario: inventarioStats,
    establecimientos: establecimientosStats,
  };
}

export function useStats() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthNew();
  const userRole = (user as any)?.role || (user as any)?.rol?.clave || '';

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stats', userRole],
    queryFn: () => fetchAllStats(userRole),
    staleTime: 2 * 60 * 1000, // 2 minutos
    enabled: !authLoading && isAuthenticated && !!userRole,
  });

  return {
    stats: data ?? DEFAULT_STATS,
    loading: isLoading,
    refetch,
  };
}
