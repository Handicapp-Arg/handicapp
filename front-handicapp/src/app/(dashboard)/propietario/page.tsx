'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { StatsGrid, StatCard } from '@/components/dashboard/StatsGrid';
import { ActionGrid, ActionCardProps } from '@/components/dashboard/ActionCard';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { 
  Sparkles,
  Trophy, 
  Stethoscope, 
  Heart, 
  Activity,
  FileText,
  Building2
} from 'lucide-react';

export default function PropietarioDashboard() {
  const router = useRouter();
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });

  // 🚀 MEJORA: Prefetching inteligente de páginas más visitadas
  useEffect(() => {
    // Esperar 2 segundos después de cargar el dashboard
    const prefetchTimer = setTimeout(() => {
      // Prefetch de las páginas más visitadas (en orden de prioridad)
      router.prefetch('/propietario/caballos');           // Prioridad 1
      router.prefetch('/propietario/establecimientos');   // Prioridad 2
      router.prefetch('/propietario/eventos');            // Prioridad 3
      router.prefetch('/propietario/salud');              // Prioridad 4
      router.prefetch('/propietario/tareas');             // Prioridad 5
    }, 2000);

    return () => clearTimeout(prefetchTimer);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasCaballos = (stats.caballos?.total || 0) > 0;
  const saludLabel = hasCaballos ? 'Excelente' : 'Sin datos';
  const saludBadges: { label: string; variant: 'default' | 'secondary' | 'outline' }[] = hasCaballos
    ? [{ label: 'Todos sanos', variant: 'outline' }]
    : [{ label: 'Agregá tu primer caballo', variant: 'outline' }];

  // Stats principales
  const dashboardStats: StatCard[] = [
    {
      label: 'Mis Caballos',
      value: stats.caballos?.total || 0,
      icon: Sparkles,
      color: 'primary',
      trend: { value: `${stats.caballos?.activos || 0} activos`, direction: 'up' },
    },
    {
      label: 'Competencias',
      value: stats.eventos?.total || 0,
      icon: Trophy,
      color: 'warning',
      badges: [{ label: `${stats.eventos?.programados || 0} próximas`, variant: 'secondary' }],
    },
    {
      label: 'Consultas Vet.',
      value: stats.eventos?.total || 0,
      icon: Stethoscope,
      color: 'info',
      trend: { value: 'Este mes', direction: 'neutral' },
    },
    {
      label: 'Estado Salud',
      value: saludLabel,
      icon: Heart,
      color: 'success',
      badges: saludBadges,
    },
  ];

  // Acciones principales
  const actions: ActionCardProps[] = [
    {
      title: 'Mis Caballos',
      description: 'Ver y administrar tus caballos',
      href: '/propietario/caballos',
      icon: Sparkles,
      colorScheme: 'blue',
      count: stats.caballos?.total || 0,
    },
    {
      title: 'Salud',
      description: 'Historial médico y control veterinario',
      href: '/propietario/salud',
      icon: Stethoscope,
      colorScheme: 'teal',
    },
    {
      title: 'Competencias',
      description: 'Gestionar eventos y competencias',
      href: '/propietario/competencias',
      icon: Trophy,
      colorScheme: 'yellow',
    },
    {
      title: 'Entrenamiento',
      description: 'Ver progreso y rutinas',
      href: '/propietario/entrenamiento',
      icon: Activity,
      colorScheme: 'cyan',
    },
    {
      title: 'Establecimientos',
      description: 'Gestionar ubicaciones',
      href: '/propietario/establecimientos',
      icon: Building2,
      colorScheme: 'green',
    },
    {
      title: 'Reportes',
      description: 'Estadísticas e informes',
      href: '/propietario/reportes',
      icon: FileText,
      colorScheme: 'purple',
    },
  ];

  return (
    <SimpleRoleGuard roles={['propietario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo propietarios pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 pt-8">
          <DashboardHero
            title="Gestiona tu Pasión Ecuestre"
            description="Administra el cuidado, salud y rendimiento de tus caballos desde una plataforma integral"
            colorScheme="blue"
            showLogo={true}
            ctaButtons={[
              {
                label: 'Ver Mis Caballos',
                href: '/propietario/caballos',
                variant: 'primary',
              },
              {
                label: 'Control de Salud',
                href: '/propietario/salud',
                variant: 'secondary',
                icon: Stethoscope,
              },
            ]}
          />
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Stats Grid - 4 columns */}
          <StatsGrid stats={dashboardStats} columns={4} />

          {/* Grid Layout: Actions + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Actions (2/3) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Acciones Rápidas
                </h2>
                <ActionGrid actions={actions} columns={2} />
              </div>
            </div>

            {/* Sidebar - Events & Alerts (1/3) */}
            <DashboardSidebar 
              role="propietario"
              eventos={eventos}
            />
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
