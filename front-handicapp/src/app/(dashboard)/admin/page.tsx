'use client';

import React from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatsGrid, StatCard } from '@/components/dashboard/StatsGrid';
import { ActionGrid, ActionCardProps } from '@/components/dashboard/ActionCard';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { getRoleInfo } from '@/lib/design-tokens';
import { Users, Building2, Activity, Settings, BarChart3, Circle } from 'lucide-react';

export default function AdminDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const roleInfo = getRoleInfo('admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  // Stats principales
  const dashboardStats: StatCard[] = [
    {
      label: 'Usuarios Totales',
      value: stats.empleados?.total || 0,
      icon: Users,
      color: 'primary',
      badges: [{ label: `${stats.empleados?.activos || 0} activos`, variant: 'secondary' }],
    },
    {
      label: 'Establecimientos',
      value: 0, // DashboardStats does not have establecimientos
      icon: Building2,
      color: 'success',
      badges: [{ label: 'Registrados', variant: 'secondary' }],
    },
    {
      label: 'Caballos Activos',
      value: stats.caballos?.total || 0,
      icon: Circle,
      color: 'accent',
      trend: { value: 'En el sistema', direction: 'up' },
    },
    {
      label: 'Eventos',
      value: eventos.length,
      icon: Activity,
      color: 'warning',
      badges: [{ label: 'Próximos', variant: 'secondary' }],
    },
  ];

  // Acciones principales
  const actions: ActionCardProps[] = [
    {
      title: 'Usuarios',
      description: 'Gestionar usuarios y permisos',
      href: '/admin/users',
      icon: Users,
      colorScheme: 'blue',
      count: stats.empleados?.total || 0,
    },
    {
      title: 'Establecimientos',
      description: 'Supervisar establecimientos',
      href: '/admin/establecimientos',
      icon: Building2,
      colorScheme: 'green',
      count: 0, // No establecimientos in DashboardStats
    },
    {
      title: 'Reportes',
      description: 'Análisis y estadísticas',
      href: '/admin/stats',
      icon: BarChart3,
      colorScheme: 'purple',
    },
    {
      title: 'Configuración',
      description: 'Ajustes del sistema',
      href: '/admin/settings',
      icon: Settings,
      colorScheme: 'orange',
    },
  ];

  return (
    <SimpleAdminOnly fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="text-gray-600">Solo administradores pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <DashboardHero
            title={roleInfo.title}
            description={roleInfo.description}
            roleEmoji={roleInfo.emoji}
            colorScheme="blue"
            showLogo={true}
            ctaButtons={[
              {
                label: 'Ver Usuarios',
                href: '/admin/users',
                variant: 'primary',
              },
              {
                label: 'Reportes',
                href: '/admin/stats',
                variant: 'secondary',
                icon: BarChart3,
              },
            ]}
          />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Grid */}
          <StatsGrid stats={dashboardStats} columns={4} />

          {/* Grid Layout: Actions + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Actions (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Administración
                </h2>
                <ActionGrid actions={actions} columns={2} />
              </div>
            </div>

            {/* Sidebar - Events (1/3) */}
            <DashboardSidebar 
              role="admin" 
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
