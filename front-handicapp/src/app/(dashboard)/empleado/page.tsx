'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useTareas } from '@/lib/hooks/useTareasQuery';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import {
  ArrowRight,
  Check,
  ClipboardList,
  Bell,
  User,
  Activity,
  CheckCircle2,
  FileText,
  Heart,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function EmpleadoDashboard() {
  const { stats, loading } = useStats();
  const { user } = useAuthNew();

  const hoy = new Date();
  const startOfDay = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0));
  const endOfDay   = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59));

  const { data: tareasHoyData, isLoading: tareasHoyLoading } = useTareas({
    limit: 50,
    fecha_desde: startOfDay.toISOString(),
    fecha_hasta: endOfDay.toISOString(),
  });

  const { data: tareasPendientesData } = useTareas({
    limit: 20,
    estado: 'pendiente',
  });

  if (loading) return <DashboardSkeleton />;

  const nombre = user?.nombre || 'Empleado';
  const tareasHoy = tareasHoyData?.data || [];
  const tareasPendientes = tareasPendientesData?.data || [];

  return (
    <SimpleRoleGuard roles={['empleado']}>
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

          {/* Fila 1: Mi resumen | Accesos rápidos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Mi resumen */}
            <section>
              <SectionHeader
                title="Mi Resumen"
                action={{ label: 'Ver tareas', href: '/empleado/tareas' }}
              />
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  title="Pendientes"
                  value={stats.tareas?.pendientes ?? 0}
                  icon={FileText}
                  iconColor="text-amber-600"
                  iconBg="bg-amber-50"
                  subtitle="asignadas"
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
                <StatCard
                  title="En Progreso"
                  value={stats.tareas?.enProgreso ?? 0}
                  icon={Activity}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-50"
                  subtitle="en curso"
                  accentBg="bg-blue-50"
                />
                <StatCard
                  title="Caballos"
                  value={stats.caballos?.activos ?? 0}
                  icon={Heart}
                  iconColor="text-slate-500"
                  iconBg="bg-slate-100"
                  subtitle="a mi cuidado"
                />
              </div>
            </section>

            {/* Accesos rápidos */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader title="Accesos Rápidos" />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Mis Tareas', href: '/empleado/tareas', desc: 'Ver asignaciones', icon: ClipboardList },
                  { label: 'Caballos', href: '/empleado/caballos', desc: 'Ver animales', icon: Heart },
                  { label: 'Notificaciones', href: '/empleado/notificaciones', desc: 'Mensajes y alertas', icon: Bell },
                  { label: 'Mi Perfil', href: '/empleado/perfil', desc: 'Configurar cuenta', icon: User },
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

          {/* Fila 2: Tareas de hoy | Tareas pendientes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">

            {/* Tareas de hoy */}
            <section>
              <SectionHeader
                title="Tareas de Hoy"
                action={{ label: 'Ver todas', href: '/empleado/tareas' }}
              />
              {tareasHoyLoading ? (
                <TareasSkeleton />
              ) : tareasHoy.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {tareasHoy.slice(0, 5).map((tarea: any) => (
                      <TareaItem key={tarea.id} tarea={tarea} href="/empleado/tareas" />
                    ))}
                  </div>
                  {tareasHoy.length > 5 && (
                    <Link href="/empleado/tareas" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group">
                      Ver {tareasHoy.length - 5} más
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={ClipboardList}
                  title="Sin tareas hoy"
                  description="No tenés tareas asignadas para hoy"
                  size="sm"
                />
              )}
            </section>

            {/* Tareas pendientes */}
            <section className="xl:border-l xl:border-slate-100 xl:pl-10">
              <SectionHeader
                title="Pendientes"
                action={{ label: 'Ver todas', href: '/empleado/tareas' }}
              />
              {tareasPendientes.length > 0 ? (
                <>
                  <div className="space-y-2.5">
                    {tareasPendientes.slice(0, 5).map((tarea: any) => (
                      <PendienteItem key={tarea.id} tarea={tarea} href="/empleado/tareas" />
                    ))}
                  </div>
                  {tareasPendientes.length > 5 && (
                    <Link href="/empleado/tareas" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-[#af936f] hover:text-slate-800 transition-colors group">
                      Ver {tareasPendientes.length - 5} más
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </>
              ) : (
                <EmptyState
                  icon={CheckCircle2}
                  title="¡Todo al día!"
                  description="No tenés tareas pendientes"
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
        {tarea.caballo?.nombre && (
          <p className="text-xs text-slate-500 mt-1">{tarea.caballo.nombre}</p>
        )}
      </div>
      {(tarea.prioridad === 'alta' || tarea.prioridad === 'critica') && (
        <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-red-50 text-red-600 border border-red-100">urgente</span>
      )}
    </Link>
  );
}

function PendienteItem({ tarea, href }: { tarea: any; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 bg-white rounded-xl border border-slate-200/70 p-4 hover:border-[#af936f]/30 hover:shadow-md transition-all duration-200 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl bg-slate-200 group-hover:bg-[#af936f]/40 transition-colors" />
      <div className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-200 group-hover:border-[#af936f]/40 transition-all flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold leading-tight text-slate-800 group-hover:text-[#af936f] transition-colors">{tarea.titulo}</p>
        {tarea.fecha_limite && (
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            Vence: {new Date(tarea.fecha_limite).toLocaleDateString('es-AR')}
          </div>
        )}
      </div>
      <ArrowRight className="flex-shrink-0 w-4 h-4 text-slate-300 group-hover:text-[#af936f] group-hover:translate-x-0.5 transition-all" />
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
