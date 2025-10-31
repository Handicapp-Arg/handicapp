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
import { ClipboardCheck, Activity, Calendar, Bell, User, Circle } from 'lucide-react';

export default function EmpleadoDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const roleInfo = getRoleInfo('empleado');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Stats principales usando design tokens
  const dashboardStats: StatCard[] = [
    {
      label: 'Tareas Pendientes',
      value: stats.tareas?.pendientes || 0,
      icon: ClipboardCheck,
      color: 'warning',
      badges: [{ label: 'Asignadas', variant: 'secondary' }],
    },
    {
      label: 'Completadas',
      value: stats.tareas?.completadas || 0,
      icon: Activity,
      color: 'success',
      trend: { value: 'Este mes', direction: 'up' },
    },
    {
      label: 'Caballos',
      value: stats.caballos?.activos || 0,
      icon: Circle,
      color: 'accent',
      badges: [{ label: 'Bajo mi cuidado', variant: 'outline' }],
    },
    {
      label: 'Eventos Próximos',
      value: eventos.length,
      icon: Calendar,
      color: 'info',
      trend: { value: 'Esta semana', direction: 'neutral' },
    },
  ];

  // Acciones principales
  const actions: ActionCardProps[] = [
    {
      title: 'Mis Tareas',
      description: 'Gestionar tareas asignadas',
      href: '/empleado/tareas',
      icon: ClipboardCheck,
      colorScheme: 'teal',
      badge: stats.tareas?.pendientes ? { 
        label: `${stats.tareas.pendientes} pendientes`, 
        variant: 'destructive' 
      } : undefined,
    },
    {
      title: 'Caballos',
      description: 'Ver caballos bajo mi cuidado',
      href: '/empleado/caballos',
      icon: Circle,
      colorScheme: 'blue',
      count: stats.caballos?.activos || 0,
    },
    {
      title: 'Eventos',
      description: 'Calendario y programación',
      href: '/empleado/eventos',
      icon: Calendar,
      colorScheme: 'purple',
    },
    {
      title: 'Notificaciones',
      description: 'Alertas y mensajes',
      href: '/empleado/notificaciones',
      icon: Bell,
      colorScheme: 'orange',
    },
    {
      title: 'Mi Perfil',
      description: 'Información personal',
      href: '/empleado/perfil',
      icon: User,
      colorScheme: 'indigo',
    },
  ];

  return (
    <SimpleRoleGuard roles={['empleado']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo empleados pueden acceder</p>
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
            colorScheme="teal"
            showLogo={true}
            ctaButtons={[
              {
                label: 'Mis Tareas',
                href: '/empleado/tareas',
                variant: 'primary',
              },
              {
                label: 'Ver Calendario',
                href: '/empleado/eventos',
                variant: 'secondary',
                icon: Calendar,
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
                  <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Acciones Rápidas
                </h2>
                <ActionGrid actions={actions} columns={2} />
              </div>
            </div>

            {/* Sidebar - Events (1/3) */}
            <DashboardSidebar 
              role="empleado" 
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
