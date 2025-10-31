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
import { Stethoscope, Activity, Calendar, FileText, ClipboardCheck, Bell, Circle } from 'lucide-react';

export default function VeterinarioDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const roleInfo = getRoleInfo('veterinario');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Stats principales
  const dashboardStats: StatCard[] = [
    {
      label: 'Pacientes',
      value: stats.caballos?.activos || 0,
      icon: Circle,
      color: 'accent',
      badges: [{ label: 'Bajo cuidado', variant: 'secondary' }],
    },
    {
      label: 'Consultas Pendientes',
      value: stats.tareas?.pendientes || 0,
      icon: Stethoscope,
      color: 'warning',
      trend: { value: 'Esta semana', direction: 'up' },
    },
    {
      label: 'Completadas',
      value: stats.tareas?.completadas || 0,
      icon: ClipboardCheck,
      color: 'success',
      badges: [{ label: 'Este mes', variant: 'outline' }],
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
      title: 'Mis Pacientes',
      description: 'Caballos bajo mi cuidado',
      href: '/veterinario/caballos',
      icon: Circle,
      colorScheme: 'purple',
      count: stats.caballos?.activos || 0,
    },
    {
      title: 'Consultas',
      description: 'Registrar y revisar consultas',
      href: '/veterinario/tareas',
      icon: Stethoscope,
      colorScheme: 'indigo',
      badge: stats.tareas?.pendientes ? { 
        label: `${stats.tareas.pendientes} pendientes`, 
        variant: 'destructive' 
      } : undefined,
    },
    {
      title: 'Eventos',
      description: 'Calendario de participaciones',
      href: '/veterinario/eventos',
      icon: Calendar,
      colorScheme: 'blue',
    },
    {
      title: 'Reportes',
      description: 'Historial e informes médicos',
      href: '/veterinario/reportes',
      icon: FileText,
      colorScheme: 'teal',
    },
    {
      title: 'Notificaciones',
      description: 'Alertas y recordatorios',
      href: '/veterinario/notificaciones',
      icon: Bell,
      colorScheme: 'orange',
    },
  ];

  return (
    <SimpleRoleGuard roles={['veterinario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo veterinarios pueden acceder</p>
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
            colorScheme="purple"
            showLogo={true}
            ctaButtons={[
              {
                label: 'Mis Pacientes',
                href: '/veterinario/caballos',
                variant: 'primary',
              },
              {
                label: 'Nueva Consulta',
                href: '/veterinario/tareas',
                variant: 'secondary',
                icon: Stethoscope,
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
                  <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Acciones Rápidas
                </h2>
                <ActionGrid actions={actions} columns={2} />
              </div>
            </div>

            {/* Sidebar - Events (1/3) */}
            <DashboardSidebar 
              role="veterinario" 
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
