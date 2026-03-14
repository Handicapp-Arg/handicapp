'use client';

import React from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import {
  Users,
  Building2,
  ArrowRight,
  Clock,
  Calendar,
  ClipboardList,
  Settings,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function AdminDashboard() {
  const { stats, loading } = useStats();
  const { eventos, loading: eventosLoading } = useEventosProximos({ limit: 5 });
  const { user } = useAuthNew();

  if (loading) return <DashboardSkeleton />;

  const nombre = user?.nombre || 'Administrador';
  const total = (stats.tareas?.pendientes ?? 0) + (stats.tareas?.enProgreso ?? 0) + (stats.tareas?.completadas ?? 0);

  return (
    <SimpleAdminOnly fallback={
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-lg font-medium text-slate-900">Acceso Denegado</p>
          <p className="text-slate-500 mt-1 text-sm">Solo administradores pueden acceder</p>
        </div>
      </div>
    }>
      <div className="max-w-[1600px] mx-auto animate-fade-in">

        {/* Greeting */}
        <div className="mb-8">
          <p className="text-[13px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">
            {getGreeting()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            {nombre}
          </h1>
        </div>

        <div className="flex flex-col gap-10">

          {/* Fila 1: Resumen del sistema | Administración */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Resumen del sistema */}
            <section>
              <SectionHeader
                title="Resumen del Sistema"
                action={{ label: 'Ver usuarios', href: '/admin/users' }}
              />
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Usuarios"
                  value={stats.empleados?.total ?? 0}
                  icon={Users}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                  subtitle={`${stats.empleados?.activos ?? 0} activos`}
                  accentBg="bg-blue-50"
                />
                <StatCard
                  title="Establecimientos"
                  value={stats.establecimientos?.total ?? 0}
                  icon={Building2}
                  iconColor="text-slate-500"
                  iconBg="bg-slate-100"
                  subtitle={`${stats.establecimientos?.activos ?? 0} activos`}
                />
                <StatCard
                  title="Caballos"
                  value={stats.caballos?.total ?? 0}
                  icon={Heart}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  subtitle={`${stats.caballos?.activos ?? 0} activos`}
                  accentBg="bg-amber-50"
                />
                <StatCard
                  title="Eventos"
                  value={eventos.length}
                  icon={Calendar}
                  iconColor="text-violet-600"
                  iconBg="bg-violet-50"
                  subtitle="próximos"
                  accentBg="bg-violet-50"
                />
              </div>
            </section>

            {/* Acciones de administración */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader title="Administración" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Usuarios', href: '/admin/users', desc: 'Gestionar cuentas', icon: Users },
                  { label: 'Establecimientos', href: '/admin/establecimientos', desc: 'Ver y editar', icon: Building2 },
                  { label: 'Caballos', href: '/admin/caballos', desc: 'Registro general', icon: ClipboardList },
                  { label: 'Configuración', href: '/admin/configuracion', desc: 'Parámetros del sistema', icon: Settings },
                ].map(({ label, href, desc, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="group bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-[#af936f]/30 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-[#af936f]/10 transition-colors">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#af936f] transition-colors" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800 group-hover:text-[#af936f] transition-colors">{label}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-slate-500">{desc}</p>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#af936f] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Fila 2: Próximos eventos | Estado de tareas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Próximos eventos */}
            <section>
              <SectionHeader
                title="Próximos Eventos"
                action={{ label: 'Ver todos', href: '/admin/eventos' }}
              />
              {eventosLoading ? (
                <EventosSkeleton />
              ) : eventos.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {eventos.slice(0, 4).map((evento) => (
                      <EventoItem key={evento.id} evento={evento} href="/admin/eventos" />
                    ))}
                  </div>
                  {eventos.length > 4 && (
                    <Link href="/admin/eventos" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group">
                      Ver todos
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState icon={Calendar} title="Sin eventos próximos" description="No hay eventos programados en el sistema" size="sm" />
              )}
            </section>

            {/* Estado de tareas */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader
                title="Estado de Tareas"
                action={{ label: 'Ver tablero', href: '/admin/tareas' }}
              />
              <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
                <div className="space-y-5">
                  {[
                    { label: 'Pendientes', value: stats.tareas?.pendientes ?? 0, color: 'bg-amber-400', track: 'bg-amber-50' },
                    { label: 'En progreso', value: stats.tareas?.enProgreso ?? 0, color: 'bg-blue-400', track: 'bg-blue-50' },
                    { label: 'Completadas', value: stats.tareas?.completadas ?? 0, color: 'bg-emerald-400', track: 'bg-emerald-50' },
                  ].map(({ label, value, color, track }) => {
                    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">{label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">{value}</span>
                            <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className={`h-2 ${track} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${color} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total en el sistema</span>
                  <span className="text-lg font-bold text-slate-800">{stats.tareas?.total ?? 0}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}

/* ── Subcomponentes ── */

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">{title}</h2>
      {action && (
        <Link href={action.href} className="text-[13px] font-medium text-slate-400 hover:text-[#af936f] transition-colors flex items-center gap-1 group">
          {action.label}
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function EventoItem({ evento, href }: { evento: any; href: string }) {
  const fecha = new Date(evento.fecha_evento);
  const esHoy = fecha.toDateString() === new Date().toDateString();
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200/70 p-4 hover:border-[#af936f]/30 hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${esHoy ? 'bg-[#af936f]' : 'bg-slate-200 group-hover:bg-[#af936f]/40'} transition-colors`} />
      <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${esHoy ? 'bg-[#af936f] text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 group-hover:border-[#af936f]/30'}`}>
        <span className="text-[9px] font-bold uppercase opacity-75">{fecha.toLocaleDateString('es-AR', { month: 'short' })}</span>
        <span className="text-lg font-bold leading-none">{fecha.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-slate-800 group-hover:text-[#af936f] transition-colors truncate">{evento.titulo}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {esHoy && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#af936f]/10 text-[#af936f] border border-[#af936f]/20">Hoy</span>}
          {evento.tipo_evento?.nombre && <span className="text-xs text-slate-500">{evento.tipo_evento.nombre}</span>}
        </div>
      </div>
      {evento.hora_inicio && (
        <span className="flex-shrink-0 flex items-center gap-1 text-xs text-slate-400 group-hover:text-[#af936f] transition-colors">
          <Clock className="w-3 h-3" />
          {evento.hora_inicio.substring(0, 5)}
        </span>
      )}
    </Link>
  );
}

function EventosSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl bg-white border border-slate-200/60 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
