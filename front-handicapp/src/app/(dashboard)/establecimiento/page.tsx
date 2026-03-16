'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats, useUpcomingEvents, useAuthNew, useTareas } from '@/lib/hooks';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Calendar, CheckSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PRIORITY_DOT: Record<string, string> = {
  critica: 'bg-red-500',
  alta: 'bg-orange-400',
  media: 'bg-amber-400',
  baja: 'bg-emerald-400',
};

export default function EstablecimientoDashboard() {
  const { stats } = useStats();
  const { eventos } = useUpcomingEvents({ limit: 5 });
  const { user } = useAuthNew();
  const { data: tareasData } = useTareas({ limit: 5, estado: 'pendiente' });

  const nombre = (user as any)?.establecimiento_nombre || user?.nombre || 'Establecimiento';
  const listaTareas = tareasData?.data || [];

  const statItems = [
    { label: 'Caballos',    value: stats.caballos?.total ?? 0,    href: '/establecimiento/horses', accent: 'border-l-violet-400', iconBg: 'bg-violet-50', icon: ClipboardList, iconColor: 'text-violet-600' },
    { label: 'Eventos',     value: stats.eventos?.total ?? 0,     href: '/establecimiento/events', accent: 'border-l-emerald-400', iconBg: 'bg-emerald-50', icon: Calendar,     iconColor: 'text-emerald-600' },
    { label: 'Pendientes',  value: stats.tareas?.pendientes ?? 0, href: '/establecimiento/tasks',  accent: 'border-l-amber-400',  iconBg: 'bg-amber-50',  icon: CheckSquare,  iconColor: 'text-amber-600' },
    { label: 'Completadas', value: stats.tareas?.completadas ?? 0,href: '/establecimiento/tasks',  accent: 'border-l-blue-400',   iconBg: 'bg-blue-50',   icon: TrendingUp,   iconColor: 'text-blue-600' },
  ];

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-6">

        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Panel de control</p>
          <h1 className="text-xl font-semibold text-gray-900 truncate">{nombre}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {statItems.map(({ label, value, href, accent, iconBg, icon: Icon, iconColor }) => (
            <Link key={label} href={href}>
              <Card className={`border-l-4 ${accent} hover:border-gray-300`}>
                <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4">
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">{label}</p>
                      <p className="text-2xl font-semibold text-gray-800 leading-none">{value}</p>
                    </div>
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Tareas del día */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
              <CardTitle className="text-base font-medium">Trabajo del Día</CardTitle>
              <Link href="/establecimiento/tasks" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 py-1 flex-shrink-0">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {listaTareas.length === 0 ? (
                <p className="px-4 pb-5 text-sm text-gray-400">Sin tareas pendientes</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {listaTareas.map((t: any) => (
                    <li key={t.id}>
                      <Link href="/establecimiento/tasks" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 min-h-[44px]">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[t.prioridad] ?? 'bg-gray-300'}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-800 truncate">{t.titulo}</p>
                          {t.asignado_a?.nombre && <p className="text-xs text-gray-400">{t.asignado_a.nombre}</p>}
                        </div>
                        {t.prioridad && (
                          <span className="text-xs text-gray-400 capitalize flex-shrink-0">{t.prioridad}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Próximos eventos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
              <CardTitle className="text-base font-medium">Próximos Eventos</CardTitle>
              <Link href="/establecimiento/events" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 py-1 flex-shrink-0">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {eventos.length === 0 ? (
                <p className="px-4 pb-5 text-sm text-gray-400">Sin eventos próximos</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {eventos.slice(0, 5).map((e: any) => {
                    const fecha = new Date(e.fecha_evento);
                    return (
                      <li key={e.id}>
                        <Link href="/establecimiento/events" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 min-h-[44px]">
                          <div className="w-9 h-9 border border-gray-200 rounded-md flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-gray-400 uppercase leading-none">
                              {fecha.toLocaleDateString('es-AR', { month: 'short' })}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 leading-tight">{fecha.getDate()}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-800 truncate">{e.titulo}</p>
                            {e.tipo_evento?.nombre && <p className="text-xs text-gray-400">{e.tipo_evento.nombre}</p>}
                          </div>
                          {e.hora_inicio && (
                            <span className="text-xs text-gray-400 flex-shrink-0">{e.hora_inicio.substring(0, 5)}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </SimpleRoleGuard>
  );
}
