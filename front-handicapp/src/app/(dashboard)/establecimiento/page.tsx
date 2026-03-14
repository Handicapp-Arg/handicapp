'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useTareas } from '@/lib/hooks/useTareasQuery';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import {
  Calendar,
  Clock,
  ArrowRight,
  Check,
  Users,
  ClipboardList,
  FileText,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function EstablecimientoDashboard() {
  const { stats, loading } = useStats();
  const { eventos, loading: eventosLoading } = useEventosProximos({ limit: 5 });
  const { user } = useAuthNew();

  const { data: tareasData, isLoading: tareasLoading } = useTareas({
    limit: 50,
    estado: 'pendiente',
  });

  if (loading) return <DashboardSkeleton />;

  const nombre = user?.establecimiento_nombre || user?.nombre || 'Establecimiento';
  const listaTareas = tareasData?.data || [];

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
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

          {/* Fila 1: Resumen | Accesos rápidos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Resumen del haras */}
            <section>
              <SectionHeader
                title="Resumen del Haras"
                action={{ label: 'Ver reportes', href: '/establecimiento/reportes' }}
              />
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Caballos"
                  value={stats.caballos?.total ?? 0}
                  icon={Heart}
                  iconColor="text-slate-500"
                  iconBg="bg-slate-100"
                  subtitle={`${stats.caballos?.activos ?? 0} activos`}
                />
                <StatCard
                  title="Personal"
                  value={stats.empleados?.total ?? 0}
                  icon={Users}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                  subtitle={`${stats.empleados?.activos ?? 0} activos`}
                  accentBg="bg-blue-50"
                />
                <StatCard
                  title="Tareas Hoy"
                  value={stats.tareas?.pendientes ?? 0}
                  icon={FileText}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  subtitle="pendientes"
                  accentBg="bg-amber-50"
                />
                <StatCard
                  title="Completadas"
                  value={stats.tareas?.completadas ?? 0}
                  icon={CheckCircle2}
                  iconColor="text-emerald-600"
                  iconBg="bg-emerald-50"
                  subtitle="este mes"
                  accentBg="bg-emerald-50"
                />
              </div>
            </section>

            {/* Accesos rápidos */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader title="Accesos Rápidos" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Caballos', href: '/establecimiento/caballos', desc: 'Ver y gestionar', icon: Heart },
                  { label: 'Personal', href: '/establecimiento/personal', desc: 'Equipo activo', icon: Users },
                  { label: 'Trabajo Diario', href: '/establecimiento/tareas', desc: 'Tareas operativas', icon: FileText },
                  { label: 'Calendario', href: '/establecimiento/eventos', desc: 'Eventos programados', icon: Calendar },
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

          {/* Fila 2: Trabajo del día | Próximos eventos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Tareas pendientes */}
            <section>
              <SectionHeader
                title="Trabajo del Día"
                action={{ label: 'Ver todas', href: '/establecimiento/tareas' }}
              />
              {tareasLoading ? (
                <TareasSkeleton />
              ) : listaTareas.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {listaTareas.slice(0, 5).map((tarea: any) => (
                      <TareaItem key={tarea.id} tarea={tarea} href="/establecimiento/tareas" />
                    ))}
                  </div>
                  {listaTareas.length > 5 && (
                    <Link href="/establecimiento/tareas" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group">
                      Ver {listaTareas.length - 5} más
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState icon={ClipboardList} title="Todo al día" description="No hay tareas pendientes" size="sm" />
              )}
            </section>

            {/* Próximos eventos */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader
                title="Próximos Eventos"
                action={{ label: 'Calendario', href: '/establecimiento/eventos' }}
              />
              {eventosLoading ? (
                <EventosSkeleton />
              ) : eventos.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {eventos.slice(0, 4).map((evento) => (
                      <EventoItem key={evento.id} evento={evento} href="/establecimiento/eventos" />
                    ))}
                  </div>
                  {eventos.length > 4 && (
                    <Link href="/establecimiento/eventos" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group">
                      Ver todos
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState icon={Calendar} title="Sin eventos próximos" description="No hay eventos programados" size="sm" />
              )}
            </section>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
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

function TareaItem({ tarea, href }: { tarea: any; href: string }) {
  const completada = tarea.estado === 'completada';
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200/70 p-4 hover:border-[#af936f]/30 hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${completada ? 'bg-emerald-400' : 'bg-[#af936f]/50 group-hover:bg-[#af936f]'} transition-colors`} />
      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${completada ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200 group-hover:border-[#af936f]/40'}`}>
        {completada && <Check className="w-3 h-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold leading-tight transition-colors ${completada ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-[#af936f]'}`}>
          {tarea.titulo}
        </p>
        {tarea.asignado_a?.nombre && (
          <div className="flex items-center gap-1 mt-1">
            <Users className="w-3 h-3 text-slate-400" />
            <p className="text-xs text-slate-500">{tarea.asignado_a.nombre}</p>
          </div>
        )}
      </div>
      {(tarea.prioridad === 'alta' || tarea.prioridad === 'critica') && (
        <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-100">{tarea.prioridad}</span>
      )}
    </Link>
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

function TareasSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-xl bg-white border border-slate-200/60 p-4 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-1/3" />
        </div>
      ))}
    </div>
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
