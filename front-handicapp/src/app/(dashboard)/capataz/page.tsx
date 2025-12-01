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
import { Users, ClipboardList, Activity, Calendar, FileText, Circle } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function CapatazDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const roleInfo = getRoleInfo('capataz');

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." variant="warning" />;
  }

  // Stats principales
  const dashboardStats: StatCard[] = [
    {
      label: 'Personal Activo',
      value: stats.empleados?.activos || 0,
      icon: Users,
      color: 'primary',
      badges: [{ label: 'Bajo supervisión', variant: 'secondary' }],
    },
    {
      label: 'Tareas Asignadas',
      value: stats.tareas?.pendientes || 0,
      icon: ClipboardList,
      color: 'warning',
      trend: { value: `${stats.tareas?.completadas || 0} completadas`, direction: 'up' },
    },
    {
      label: 'Caballos',
      value: stats.caballos?.activos || 0,
      icon: Circle,
      color: 'accent',
      badges: [{ label: 'En cuidado', variant: 'outline' }],
    },
    {
      label: 'Eventos Próximos',
      value: eventos.length,
      icon: Calendar,
      color: 'info',
      trend: { value: 'Programados', direction: 'neutral' },
    },
  ];

  // Acciones principales
  const actions: ActionCardProps[] = [
    {
      title: 'Personal',
      description: 'Supervisar empleados',
      href: '/capataz/personal',
      icon: Users,
      colorScheme: 'orange',
      count: stats.empleados?.activos || 0,
    },
    {
      title: 'Tareas',
      description: 'Asignar y monitorear tareas',
      href: '/capataz/tareas',
      icon: ClipboardList,
      colorScheme: 'red',
      badge: stats.tareas?.pendientes ? { 
        label: `${stats.tareas.pendientes} pendientes`, 
        variant: 'destructive' 
      } : undefined,
    },
    {
      title: 'Caballos',
      description: 'Recursos bajo cuidado',
      href: '/capataz/caballos',
      icon: Circle,
      colorScheme: 'teal',
    },
    {
      title: 'Eventos',
      description: 'Calendario y programación',
      href: '/capataz/eventos',
      icon: Calendar,
      colorScheme: 'blue',
    },
    {
      title: 'Reportes',
      description: 'Informes de operaciones',
      href: '/capataz/reportes',
      icon: FileText,
      colorScheme: 'purple',
    },
  ];

  return (
    <SimpleRoleGuard roles={['capataz']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo capataces pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <DashboardHero
            title={roleInfo.title}
            description={roleInfo.description}
            roleEmoji={roleInfo.emoji}
            colorScheme="orange"
            showLogo={true}
            ctaButtons={[
              {
                label: 'Ver Personal',
                href: '/capataz/personal',
                variant: 'primary',
              },
              {
                label: 'Asignar Tareas',
                href: '/capataz/tareas',
                variant: 'secondary',
                icon: ClipboardList,
              },
            ]}
          />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Grid */}
          <StatsGrid stats={dashboardStats} columns={4} />

          {/* Grid Layout: Actions + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Actions (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Acciones Rápidas
                </h2>
                <ActionGrid actions={actions} columns={2} />
              </div>
            </div>

            {/* Sidebar - Events (1/3) */}
            <DashboardSidebar 
              role="capataz" 
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
