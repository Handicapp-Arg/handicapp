'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatsGrid, StatCard } from '@/components/dashboard/StatsGrid';
import { ActionGrid, ActionCardProps } from '@/components/dashboard/ActionCard';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { getRoleInfo } from '@/lib/design-tokens';
import { Users, Activity, Wrench, Calendar, FileText, Circle, Package } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function EstablecimientoDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const roleInfo = getRoleInfo('establecimiento');

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." />;
  }

  // Stats principales
  const dashboardStats: StatCard[] = [
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

  // Acciones principales
  const actions: ActionCardProps[] = [
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
      title: 'Eventos',
      description: 'Calendario y competencias',
      href: '/establecimiento/eventos',
      icon: Calendar,
      colorScheme: 'purple',
    },
    {
      title: 'Reportes',
      description: 'Estadísticas e informes',
      href: '/establecimiento/reportes',
      icon: FileText,
      colorScheme: 'teal',
    },
  ];

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHero
          title={roleInfo.title}
          description="Gestión integral del establecimiento"
          roleEmoji={roleInfo.emoji}
          colorScheme="green"
          ctaButtons={[
            {
              label: 'Ver Tareas',
              href: '/establecimiento/tareas',
              variant: 'primary',
            },
            {
              label: 'Ver Caballos',
              href: '/establecimiento/caballos',
              variant: 'secondary',
            },
          ]}
        />

        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          <StatsGrid stats={dashboardStats} columns={4} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                Panel de Control
              </h2>
              <ActionGrid actions={actions} columns={2} />
            </div>

            <DashboardSidebar 
              role="establecimiento"
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
