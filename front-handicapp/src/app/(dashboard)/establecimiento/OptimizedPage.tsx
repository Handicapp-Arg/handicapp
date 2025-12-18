/**
 * 🚀 DASHBOARD OPTIMIZADO PARA ESTABLECIMIENTO
 * Máximo rendimiento con memoización y cache inteligente
 */

'use client';

import React, { memo, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { OptimizedStatsGrid, StatCard } from '@/components/dashboard/OptimizedStatsGrid';
import { ActionGrid, ActionCardProps } from '@/components/dashboard/ActionCard';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useOptimizedStats } from '@/lib/hooks/useOptimizedStats';
import { useEventosProximosOptimized } from '@/lib/hooks/useEventosProximosOptimized';
import { getRoleInfo } from '@/lib/design-tokens';
import { Users, Activity, Wrench, Calendar, FileText, Circle, Package } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

// 🚀 Componente de loading memoizado
const OptimizedLoading = memo(() => (
  <LoadingSpinnerFullPage label="Cargando dashboard..." />
));

OptimizedLoading.displayName = 'OptimizedLoading';

// 🚀 Hero memoizado con props estables
const MemoizedHero = memo<{
  roleInfo: ReturnType<typeof getRoleInfo>;
}>(({ roleInfo }) => (
  <DashboardHero
    title={roleInfo.title}
    description={roleInfo.description}
    roleEmoji={roleInfo.emoji}
  />
));

MemoizedHero.displayName = 'MemoizedHero';

export default function OptimizedEstablecimientoDashboard() {
  const { data: stats, isLoading: loadingStats, error } = useOptimizedStats();
  const { data: eventosData, isLoading: loadingEventos } = useEventosProximosOptimized({ limit: 5 });
  
  // 🚀 Memoizar roleInfo para evitar recreación
  const roleInfo = useMemo(() => getRoleInfo('establecimiento'), []);
  
  // 🚀 Stats memoizadas para evitar recrear array en cada render
  const dashboardStats = useMemo((): StatCard[] => {
    if (!stats) return [];
    
    return [
      {
        label: 'Caballos',
        value: stats.caballos?.activos || 0,
        icon: Circle,
        color: 'success',
        badges: [{ label: `${stats.caballos?.total || 0} total`, variant: 'secondary' }],
      },
      {
        label: 'Personal',
        value: stats.empleados?.activos || 0,
        icon: Users,
        color: 'primary',
        badges: [{ label: `${stats.empleados?.total || 0} total`, variant: 'secondary' }],
      },
      {
        label: 'Inventario',
        value: stats.inventario?.total || 0,
        icon: Package,
        color: 'warning',
        badges: [{ label: `${stats.inventario?.stockBajo || 0} stock bajo`, variant: 'outline' }],
      },
      {
        label: 'Tareas Pendientes',
        value: stats.tareas?.pendientes || 0,
        icon: Activity,
        color: 'danger',
        badges: [{ label: `${stats.tareas?.completadas || 0} completadas`, variant: 'outline' }],
      },
    ];
  }, [stats]);

  // 🚀 Actions memoizadas para evitar recrear array
  const actions = useMemo((): ActionCardProps[] => {
    if (!stats) return [];
    
    return [
      {
        title: 'Caballos',
        description: 'Administrar caballos del establecimiento',
        href: '/establecimiento/caballos',
        icon: Circle,
        colorScheme: 'green',
        count: stats.caballos?.total || 0,
      },
      {
        title: 'Personal',
        description: 'Gestionar empleados',
        href: '/establecimiento/personal',
        icon: Users,
        colorScheme: 'blue',
        count: stats.empleados?.total || 0,
        badge: stats.empleados?.activos ? { 
          label: `${stats.empleados.activos} activos`, 
          variant: 'default' 
        } : undefined,
      },
      {
        title: 'Inventario',
        description: 'Productos y stock',
        href: '/establecimiento/inventario',
        icon: Package,
        colorScheme: 'yellow',
        count: stats.inventario?.total || 0,
        badge: stats.inventario?.stockBajo ? { 
          label: `${stats.inventario.stockBajo} stock bajo`, 
          variant: 'destructive' 
        } : undefined,
      },
      {
        title: 'Tareas',
        description: 'Mantenimiento y programación',
        href: '/establecimiento/tareas',
        icon: Wrench,
        colorScheme: 'orange',
        badge: stats.tareas?.pendientes ? { 
          label: `${stats.tareas.pendientes} pendientes`, 
          variant: 'destructive' 
        } : undefined,
      },
      {
        title: 'Calendario',
        description: 'Eventos y programación',
        href: '/establecimiento/eventos',
        icon: Calendar,
        colorScheme: 'blue',
        count: eventosData?.eventos?.length || 0,
      },
      {
        title: 'Reportes',
        description: 'Análisis y estadísticas',
        href: '/establecimiento/reportes',
        icon: FileText,
        colorScheme: 'purple',
      },
    ];
  }, [stats, eventosData]);

  // 🚀 Early return para loading
  if (loadingStats) {
    return <OptimizedLoading />;
  }

  // 🚀 Early return para error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600">Por favor, recarga la página</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-8 p-6">
        {/* Hero Section */}
        <MemoizedHero roleInfo={roleInfo} />

        {/* Stats Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen General</h2>
          <OptimizedStatsGrid stats={dashboardStats} columns={4} loading={loadingStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Actions Grid */}
          <div className="xl:col-span-3">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Principales</h2>
            <ActionGrid actions={actions} />
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <DashboardSidebar 
              role="establecimiento"
              eventos={eventosData?.eventos || []}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}