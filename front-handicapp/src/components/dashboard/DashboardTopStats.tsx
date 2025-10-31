import React, { useMemo } from 'react';
import { StatCard } from './DashboardComponents';
import { useStats } from '@/lib/hooks/useStats';
import { ArrowUpIcon, ArrowDownIcon, CalendarDaysIcon, UsersIcon } from '@heroicons/react/24/outline';

function Sparkline({ points, color = '#D1B79A' }: { points: number[]; color?: string }) {
  const max = Math.max(...points, 1);
  const path = points.map((p, i) => `${(i / (points.length - 1)) * 100},${100 - (p / max) * 100}`).join(' ');
  return (
    <svg className="w-full h-6" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth={2} points={path} />
    </svg>
  );
}

/**
 * DashboardTopStats
 * Connects to backend via `useStats` and renders 4 stat/action cards using real data.
 */
export default function DashboardTopStats() {
  const { stats, loading } = useStats();

  // Derive simple sparkline points from available counts. We don't have historic series
  // from the API here, so build lightweight series from the single stat values to show trend.
  const caballosPoints = useMemo(() => [Math.max(0, stats.caballos.total - 3), Math.max(0, stats.caballos.total - 1), stats.caballos.total], [stats.caballos.total]);
  const activosPoints = useMemo(() => [Math.max(0, stats.caballos.activos - 2), Math.max(0, stats.caballos.activos - 1), stats.caballos.activos], [stats.caballos.activos]);
  const eventosPoints = useMemo(() => [Math.max(0, stats.eventos.total - 4), Math.max(0, stats.eventos.total - 2), stats.eventos.total], [stats.eventos.total]);
  const tareasPoints = useMemo(() => [Math.max(0, stats.tareas.total - 3), Math.max(0, stats.tareas.total - 1), stats.tareas.total], [stats.tareas.total]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Caballos"
        value={loading ? '...' : stats.caballos.total}
        subtitle={`${loading ? 'cargando' : stats.caballos.activos} activos • ${loading ? '-' : stats.caballos.nuevos} nuevos (30d)`}
        icon={<UsersIcon className="h-5 w-5 text-white" aria-hidden />}
        trend={{ value: Math.round((stats.caballos.total || 0) === 0 ? 0 : (stats.caballos.nuevos / Math.max(1, stats.caballos.total)) * 100), isPositive: stats.caballos.nuevos >= 0 }}
      >
        <Sparkline points={caballosPoints} />
      </StatCard>

      <StatCard
        title="Activos"
        value={loading ? '...' : stats.caballos.activos}
        subtitle="Caballos con estado activo"
        icon={<ArrowUpIcon className="h-5 w-5 text-white" aria-hidden />}
        trend={{ value: 0, isPositive: true }}
      >
        <Sparkline points={activosPoints} />
      </StatCard>

      <StatCard
        title="Eventos"
        value={loading ? '...' : stats.eventos.total}
        subtitle={`${loading ? '-' : stats.eventos.urgentes} urgentes`}
        icon={<CalendarDaysIcon className="h-5 w-5 text-white" aria-hidden />}
        trend={{ value: stats.eventos.total > 0 ? Math.round((stats.eventos.programados / stats.eventos.total) * 100) : 0, isPositive: stats.eventos.programados >= 0 }}
      >
        <Sparkline points={eventosPoints} />
      </StatCard>

      <StatCard
        title="Tareas"
        value={loading ? '...' : stats.tareas.total}
        subtitle={loading ? 'cargando...' : `${stats.tareas.pendientes} pendientes • ${stats.tareas.completadas} completadas`}
        icon={<ArrowDownIcon className="h-5 w-5 text-white" aria-hidden />}
        trend={{ value: 0, isPositive: stats.tareas.enProgreso >= 0 }}
      >
        <Sparkline points={tareasPoints} />
      </StatCard>
    </div>
  );
}
