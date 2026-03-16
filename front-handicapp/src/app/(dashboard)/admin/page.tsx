'use client';

import React from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { useStats, useUpcomingEvents, useAuthNew } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Users, Building2, ClipboardList, CheckSquare } from 'lucide-react';
import Link from 'next/link';

const STAT_COLORS = [
  { accent: 'border-l-violet-400', iconBg: 'bg-violet-50', icon: Users,        iconColor: 'text-violet-600' },
  { accent: 'border-l-blue-400',   iconBg: 'bg-blue-50',   icon: Building2,    iconColor: 'text-blue-600' },
  { accent: 'border-l-emerald-400',iconBg: 'bg-emerald-50', icon: ClipboardList,iconColor: 'text-emerald-600' },
  { accent: 'border-l-amber-400',  iconBg: 'bg-amber-50',  icon: CheckSquare,  iconColor: 'text-amber-600' },
];

export default function AdminDashboard() {
  const { stats } = useStats();
  const { eventos } = useUpcomingEvents({ limit: 5 });
  const { user } = useAuthNew();

  const nombre = user?.nombre || 'Administrador';
  const total = (stats.tareas?.pendientes ?? 0) + (stats.tareas?.enProgreso ?? 0) + (stats.tareas?.completadas ?? 0);

  return (
    <SimpleAdminOnly fallback={<p className="text-sm text-gray-500">Acceso denegado</p>}>
      <div className="space-y-6">

        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Panel de control</p>
          <h1 className="text-xl font-semibold text-gray-900">Hola, {nombre}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Usuarios',         value: stats.usuarios?.total ?? 0 },
            { label: 'Establecimientos', value: stats.establecimientos?.total ?? 0 },
            { label: 'Caballos',         value: stats.caballos?.total ?? 0 },
            { label: 'Tareas',           value: stats.tareas?.total ?? 0 },
          ].map(({ label, value }, i) => {
            const { accent, iconBg, icon: Icon, iconColor } = STAT_COLORS[i];
            return (
              <Card key={label} className={`border-l-4 ${accent}`}>
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
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Administración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Administración</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {[
                  { label: 'Usuarios',          href: '/admin/users' },
                  { label: 'Establecimientos',  href: '/admin/stables' },
                  { label: 'Caballos',          href: '/admin/horses' },
                  { label: 'Configuración',     href: '/admin/settings' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="flex items-center justify-between px-4 sm:px-6 py-3.5 hover:bg-gray-50 text-sm text-gray-800 min-h-[44px]">
                      {label}
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Estado de tareas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-medium">Estado de Tareas</CardTitle>
              <Link href="/admin/tasks" className="text-sm text-gray-500 hover:text-gray-800 py-1">Ver tablero</Link>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  { label: 'Pendientes',  value: stats.tareas?.pendientes ?? 0 },
                  { label: 'En progreso', value: stats.tareas?.enProgreso ?? 0 },
                  { label: 'Completadas', value: stats.tareas?.completadas ?? 0 },
                ].map(({ label, value }) => (
                  <li key={label} className="flex justify-between text-sm py-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </li>
                ))}
                <li className="flex justify-between text-sm border-t border-gray-100 pt-2">
                  <span className="text-gray-500">Total</span>
                  <span className="font-semibold text-gray-800">{total}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Próximos eventos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base font-medium">Próximos Eventos</CardTitle>
              <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-800 py-1">Ver todos</Link>
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
                        <Link href="/admin/events" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 min-h-[44px]">
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
    </SimpleAdminOnly>
  );
}
