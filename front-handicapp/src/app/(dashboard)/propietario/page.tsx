'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useEventos } from '@/lib/hooks/useEventosQuery';
import { useStats } from '@/lib/hooks/useStats';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { useTareas } from '@/lib/hooks/useTareasQuery';
import { usePropietarioDashboard } from '@/lib/hooks/usePropietarioDashboard';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Plus,
  ArrowRight,
  ClipboardList,
  Check,
  Sun,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function safeDateStr(dateStr: string) {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
    return `${new Date().toISOString().split('T')[0]}T${dateStr}`;
  }
  return dateStr;
}

export default function PropietarioDashboard() {
  const { user } = useAuthNew();
  const { data: dashboardData, isLoading: dashboardLoading } = usePropietarioDashboard();

  const { data: caballosData, isLoading: caballosLoading } = useCaballos(
    { page: 1, limit: 10 },
    { enabled: !dashboardData }
  );

  const hoy = new Date();
  const startOfDay = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59));

  const { data: tareasData } = useTareas({
    limit: 100,
    fecha_desde: startOfDay.toISOString(),
    fecha_hasta: endOfDay.toISOString(),
  });

  const { data: eventosHoyResp } = useEventos({
    fecha_desde: startOfDay.toISOString(),
    fecha_hasta: endOfDay.toISOString(),
    limit: 100,
  });

  const caballos =
    dashboardData?.caballos ||
    (caballosData as any)?.data?.caballos ||
    (caballosData as any)?.caballos ||
    [];
  const gastosStats = dashboardData?.gastosStats || {
    mesActual: 0,
    mesAnterior: 0,
    diferencia: 0,
    tipo: 'aumento' as const,
  };
  const eventos = dashboardData?.eventos || [];
  const gastosLoading = dashboardLoading;
  const eventosHoy = Array.isArray(eventosHoyResp) ? eventosHoyResp : [];
  const listaTareas = tareasData?.data || [];

  const actividadesHoy = [
    ...listaTareas.map((t: any) => ({
      ...t,
      tipoItem: 'tarea',
      horaRef: t.fecha_limite || t.fecha_vencimiento || t.created_at,
    })),
    ...eventosHoy.map((e: any) => {
      let refDate = e.fecha_evento;
      if (e.hora_inicio && e.fecha_evento) {
        const datePart = e.fecha_evento.split('T')[0];
        refDate = `${datePart}T${e.hora_inicio}`;
      }
      return { ...e, tipoItem: 'evento', horaRef: refDate };
    }),
  ].sort((a, b) => {
    return new Date(safeDateStr(a.horaRef)).getTime() - new Date(safeDateStr(b.horaRef)).getTime();
  });

  const propietarioNombre = user?.nombre || 'Propietario';

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="max-w-[1600px] mx-auto animate-fade-in">

        {/* ── Greeting ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[13px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">
              {getGreeting()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              {propietarioNombre}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 bg-[#af936f]/10 text-[#af936f] px-3 py-1.5 rounded-xl">
            <Sun className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-10">

          {/* ── Fila 1: Finanzas + Mis Caballos ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Finanzas */}
            <section>
              <SectionHeader title="Finanzas" />
              {gastosLoading ? (
                <FinanzasSkeleton />
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/70 p-6 relative overflow-hidden group shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/60" />
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#af936f]/5 rounded-full blur-2xl group-hover:bg-[#af936f]/10 transition-colors duration-500" />

                  <div className="relative flex flex-col h-full gap-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                          Total Gastos
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl text-slate-300 font-light">$</span>
                          <span className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight leading-none">
                            {gastosStats.mesActual.toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border text-xs font-bold flex-shrink-0 ${
                          gastosStats.tipo === 'aumento'
                            ? 'bg-red-50 border-red-100 text-red-600'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}
                      >
                        {gastosStats.tipo === 'aumento' ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {gastosStats.diferencia}%
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-slate-100/80">
                      <div>
                        <p className="text-xs text-slate-400 mb-0.5">vs mes anterior</p>
                        <p className="text-sm font-semibold text-slate-600">
                          ${gastosStats.mesAnterior.toLocaleString('es-AR')}
                        </p>
                      </div>
                      <svg
                        className="hidden sm:block w-24 h-8 text-[#af936f] opacity-50 group-hover:opacity-100 transition-opacity"
                        viewBox="0 0 100 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 70 5, 100 15"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Mis Caballos */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader
                title="Mis Caballos"
                action={{ label: 'Ver todos', href: '/propietario/caballos' }}
              />
              {caballosLoading ? (
                <CaballosSkeleton />
              ) : caballos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {caballos.slice(0, 3).map((caballo: any) => (
                    <Link
                      key={caballo.id}
                      href={`/propietario/caballos/${caballo.id}`}
                      className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 shadow-sm hover:shadow-md transition-all"
                    >
                      {caballo.foto_url ? (
                        <Image
                          src={caballo.foto_url}
                          alt={caballo.nombre}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-100 to-slate-200">
                          <Heart className="h-7 w-7 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-3 pt-8">
                        <p className="text-white font-semibold text-xs truncate">{caballo.nombre}</p>
                        <p className="text-white/70 text-[10px] truncate">{caballo.raza || 'Sin raza'}</p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/propietario/caballos/nuevo"
                    className="aspect-[4/5] rounded-xl border-2 border-dashed border-[#af936f]/25 hover:border-[#af936f]/60 flex flex-col items-center justify-center text-[#af936f]/60 hover:text-[#af936f] hover:bg-[#af936f]/5 transition-all group"
                  >
                    <Plus className="h-6 w-6 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Agregar</span>
                  </Link>
                </div>
              ) : (
                <EmptyState
                  icon={Heart}
                  title="Sin caballos registrados"
                  description="Registrá tu primer caballo para empezar"
                  action={{ label: 'Registrar caballo', href: '/propietario/caballos/nuevo' }}
                />
              )}
            </section>
          </div>

          {/* ── Fila 2: Reporte Diario + Próximos Eventos ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Reporte Diario */}
            <section>
              <SectionHeader title="Hoy" />
              {dashboardLoading ? (
                <ActivitySkeleton />
              ) : actividadesHoy.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {actividadesHoy.slice(0, 5).map((item: any) => {
                      const completado = item.estado === 'completada' || item.estado === 'completado';
                      const esEvento = item.tipoItem === 'evento';
                      const link = esEvento
                        ? `/propietario/eventos/${item.id}`
                        : `/propietario/tareas/${item.id}`;
                      return (
                        <ActivityItem
                          key={`${item.tipoItem}-${item.id}`}
                          href={link}
                          title={item.titulo}
                          completado={completado}
                          esEvento={esEvento}
                          hora={
                            item.hora_inicio
                              ? item.hora_inicio.substring(0, 5)
                              : item.fecha_limite || item.fecha_vencimiento
                              ? new Date(item.fecha_limite || item.fecha_vencimiento).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : null
                          }
                          caballo={item.caballo?.nombre}
                          tipoEvento={item.tipo_evento?.nombre}
                        />
                      );
                    })}
                  </div>
                  {actividadesHoy.length > 5 && (
                    <Link
                      href="/propietario/tareas"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group"
                    >
                      Ver todas
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="Todo al día"
                  description="No hay actividades pendientes para hoy"
                  size="sm"
                />
              )}
            </section>

            {/* Próximos Eventos */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader
                title="Próximos Eventos"
                action={{ label: 'Calendario', href: '/propietario/eventos' }}
              />
              {dashboardLoading ? (
                <EventosSkeleton />
              ) : eventos && eventos.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {eventos.slice(0, 4).map((evento: any) => {
                      const fecha = new Date(evento.fecha_evento);
                      const esHoy = fecha.toDateString() === new Date().toDateString();
                      const estasSemana =
                        (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7;
                      return (
                        <EventoItem
                          key={evento.id}
                          href={`/propietario/eventos/${evento.id}`}
                          titulo={evento.titulo}
                          fecha={fecha}
                          esHoy={esHoy}
                          estasSemana={estasSemana}
                          horaInicio={evento.hora_inicio}
                          tipoEvento={evento.tipo_evento?.nombre}
                          caballo={evento.caballo?.nombre}
                        />
                      );
                    })}
                  </div>
                  {eventos.length > 4 && (
                    <Link
                      href="/propietario/eventos"
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group"
                    >
                      Ver todos
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Sin eventos próximos"
                  description="Los eventos programados aparecerán aquí"
                  size="sm"
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}

/* ── Sub-componentes locales ── */

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="text-[13px] font-medium text-slate-400 hover:text-[#af936f] transition-colors flex items-center gap-1 group"
        >
          {action.label}
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function ActivityItem({
  href,
  title,
  completado,
  esEvento,
  hora,
  caballo,
  tipoEvento,
}: {
  href: string;
  title: string;
  completado: boolean;
  esEvento: boolean;
  hora: string | null;
  caballo?: string;
  tipoEvento?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200/70 p-4 hover:border-[#af936f]/30 hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      {/* Status bar left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
          completado ? 'bg-emerald-400' : esEvento ? 'bg-blue-400' : 'bg-[#af936f]/60 group-hover:bg-[#af936f]'
        } transition-colors`}
      />

      {/* Icon */}
      <div
        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
          completado
            ? 'bg-emerald-500 text-white'
            : esEvento
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-slate-50 border-2 border-slate-200 group-hover:border-[#af936f]/40'
        }`}
      >
        {completado ? (
          <Check className="w-3.5 h-3.5" />
        ) : esEvento ? (
          <div className="w-2 h-2 rounded-full bg-blue-400" />
        ) : null}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p
            className={`text-[14px] font-semibold leading-tight ${
              completado ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-[#af936f]'
            } transition-colors`}
          >
            {title}
          </p>
          {hora && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[12px] font-medium text-slate-400 group-hover:text-[#af936f] transition-colors">
              <Clock className="w-3 h-3" />
              {hora}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {esEvento ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="w-2.5 h-2.5" />
              {tipoEvento || 'Evento'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <ClipboardList className="w-2.5 h-2.5" />
              Tarea
            </span>
          )}
          {caballo && (
            <span className="text-[11px] text-slate-400">· {caballo}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EventoItem({
  href,
  titulo,
  fecha,
  esHoy,
  estasSemana,
  horaInicio,
  tipoEvento,
  caballo,
}: {
  href: string;
  titulo: string;
  fecha: Date;
  esHoy: boolean;
  estasSemana: boolean;
  horaInicio?: string;
  tipoEvento?: string;
  caballo?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200/70 p-4 hover:border-[#af936f]/30 hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl transition-colors ${
          esHoy ? 'bg-[#af936f]' : estasSemana ? 'bg-blue-400' : 'bg-slate-200 group-hover:bg-[#af936f]/40'
        }`}
      />

      {/* Date badge */}
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
          esHoy
            ? 'bg-[#af936f] text-white shadow-sm'
            : 'bg-slate-50 text-slate-600 border border-slate-200 group-hover:border-[#af936f]/30'
        }`}
      >
        <span className="text-[9px] font-bold uppercase tracking-wide opacity-75">
          {fecha.toLocaleDateString('es-AR', { month: 'short' })}
        </span>
        <span className="text-[18px] font-bold leading-tight">{fecha.getDate()}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-[14px] font-semibold text-slate-800 leading-tight group-hover:text-[#af936f] transition-colors">
            {titulo}
          </p>
          {horaInicio && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[12px] font-medium text-slate-400 group-hover:text-[#af936f] transition-colors">
              <Clock className="w-3 h-3" />
              {horaInicio.substring(0, 5)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {esHoy && (
            <span className="inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#af936f]/10 text-[#af936f] border border-[#af936f]/20">
              Hoy
            </span>
          )}
          {tipoEvento && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="w-2.5 h-2.5" />
              {tipoEvento}
            </span>
          )}
          {caballo && (
            <span className="text-[11px] text-slate-400">· {caballo}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── Skeletons inline ── */
function FinanzasSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-6 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
      <div className="h-12 bg-slate-200 rounded w-48 mb-6" />
      <div className="border-t border-slate-100 pt-4">
        <div className="h-3 bg-slate-100 rounded w-28" />
      </div>
    </div>
  );
}

function CaballosSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-white border border-slate-200/60 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-lg bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventosSkeleton() {
  return (
    <div className="space-y-2.5">
      {[1, 2, 3].map((i) => (
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
