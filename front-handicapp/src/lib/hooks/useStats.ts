
'use client';

import { useState, useEffect } from 'react';
import { caballoService } from '@/lib/services/caballoService';
import { eventoService } from '@/lib/services/eventoService';
import { tareaService } from '@/lib/services/tareaService';
import { gestionPersonalService } from '@/lib/gestionPersonalService';
import { inventarioService } from '@/lib/inventarioService';
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
}

export function useStats() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthNew();
  const [stats, setStats] = useState<DashboardStats>({
    caballos: { total: 0, activos: 0, conEventos: 0, nuevos: 0 },
    eventos: { total: 0, urgentes: 0, programados: 0, completados: 0 },
    tareas: { total: 0, pendientes: 0, completadas: 0, enProgreso: 0 },
    empleados: { total: 0, activos: 0, departamentos: 0, nuevos: 0 },
    inventario: { total: 0, stockBajo: 0, categorias: 0, valorTotal: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchStats();
    }
  }, [authLoading, isAuthenticated, user]);

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

      // Fetch empleados stats
      let empleadosStats = { total: 0, activos: 0, departamentos: 0, nuevos: 0 };
      try {
        const empleadosResponse: any = await gestionPersonalService.getEmpleados();
        const empleados = empleadosResponse || [];
        
        // Contar departamentos únicos
        const deptosUnicos = new Set(empleados.map((e: any) => e.departamento).filter(Boolean));
        
        // Empleados nuevos (últimos 30 días)
        const treintaDias = new Date();
        treintaDias.setDate(treintaDias.getDate() - 30);
        
        empleadosStats = {
          total: empleados.length,
          activos: empleados.filter((e: any) => e.estado === 'activo').length,
          departamentos: deptosUnicos.size,
          nuevos: empleados.filter((e: any) => {
            return e.fecha_ingreso && new Date(e.fecha_ingreso) > treintaDias;
          }).length
        };
      } catch (error) {
        console.error('Error fetching empleados stats:', error);
      }

      // Fetch inventario stats (solo para rol establecimiento)
      let inventarioStats = { total: 0, stockBajo: 0, categorias: 0, valorTotal: 0 };
      
      // Solo cargar inventario si el usuario es establecimiento
      const userRole = (user as any)?.role || (user as any)?.rol?.clave;
      if (userRole === 'establecimiento') {
        try {
          const productosResponse: any = await inventarioService.getProductos();
          const productos = productosResponse || [];
          
          // Contar categorías únicas
          const categoriasUnicas = new Set(productos.map((p: any) => p.categoria_id));
          
          // Calcular valor total
          const valorTotal = productos.reduce((sum: number, p: any) => {
            return sum + (p.stock_actual * p.precio_unitario);
          }, 0);
          
          inventarioStats = {
            total: productos.length,
            stockBajo: productos.filter((p: any) => p.stock_actual < p.stock_minimo).length,
            categorias: categoriasUnicas.size,
            valorTotal: Math.round(valorTotal)
          };
        } catch (error) {
          console.error('Error fetching inventario stats:', error);
        }
      }

      setStats({
        caballos: caballosStats,
        eventos: eventosStats,
        tareas: tareasStats,
        empleados: empleadosStats,
        inventario: inventarioStats
      });
    } catch (error) {
  console.error('Error fetching stats:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, refetch: fetchStats };
}