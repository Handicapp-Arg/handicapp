'use client';

import React from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { 
  ClipboardCheck,
  Circle, 
  Calendar, 
  Bell,
  User,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import Link from 'next/link';

export default function EmpleadoDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const { user } = useAuthNew();

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." />;
  }

  const empleadoNombre = user?.nombre || 'Empleado';
  const today = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SimpleRoleGuard roles={['empleado']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header Hero con efectos visuales */}
        <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-slate-800 shadow-xl overflow-hidden">
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0e445d] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#af936f] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Líneas decorativas */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0e445d] to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#af936f] to-transparent"></div>
          </div>

          <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 
                  className="text-2xl sm:text-4xl text-white mb-2 drop-shadow-lg animate-fade-in"
                  style={{ 
                    fontFamily: 'var(--font-outfit), Outfit, sans-serif',
                    fontWeight: 700,
                    letterSpacing: '-0.5px',
                    textShadow: '0 0 30px rgba(175, 147, 111, 0.5)'
                  }}
                >
                  Hola, {empleadoNombre}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 capitalize flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Calendar className="h-4 w-4" />
                  {today}
                </p>
              </div>
              <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Link
                  href="/empleado/tareas"
                  className="group relative px-5 py-3 bg-gradient-to-r from-[#af936f] to-[#8f7657] text-white text-sm font-semibold rounded-lg overflow-hidden transition-all duration-200 flex items-center gap-2"
                >
                  {/* Efecto de brillo en hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine"></div>
                  <ClipboardCheck className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Mis Tareas</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Métricas con gradientes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Tareas Pendientes */}
            <div className="group bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:shadow-orange-500/50 transition-shadow">
                  <ClipboardCheck className="h-6 w-6 text-white" />
                </div>
                {(stats.tareas?.pendientes || 0) > 0 && (
                  <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full animate-pulse">
                    Asignadas
                  </span>
                )}
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.tareas?.pendientes || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">Tareas Pendientes</p>
            </div>

            {/* Completadas */}
            <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                  Este mes
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.tareas?.completadas || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">Completadas</p>
            </div>

            {/* Caballos */}
            <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  <Circle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                  Activos
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.caballos?.activos || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">A mi cuidado</p>
            </div>

            {/* Eventos */}
            <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                  Próximos
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {eventos.length}
              </p>
              <p className="text-sm font-medium text-slate-600">Eventos</p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>Acciones Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <Link
                href="/empleado/tareas"
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-teal-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 bg-teal-100 rounded-lg mb-3 w-fit group-hover:bg-teal-500 transition-colors">
                  <ClipboardCheck className="h-5 w-5 text-teal-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Mis Tareas</p>
              </Link>

              <Link
                href="/empleado/caballos"
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 bg-blue-100 rounded-lg mb-3 w-fit group-hover:bg-blue-500 transition-colors">
                  <Circle className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Caballos</p>
              </Link>

              <Link
                href="/empleado/eventos"
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 bg-purple-100 rounded-lg mb-3 w-fit group-hover:bg-purple-500 transition-colors">
                  <Calendar className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Eventos</p>
              </Link>

              <Link
                href="/empleado/notificaciones"
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-amber-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 bg-amber-100 rounded-lg mb-3 w-fit group-hover:bg-amber-500 transition-colors">
                  <Bell className="h-5 w-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
              </Link>

              <Link
                href="/empleado/perfil"
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="p-2 bg-indigo-100 rounded-lg mb-3 w-fit group-hover:bg-indigo-500 transition-colors">
                  <User className="h-5 w-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Mi Perfil</p>
              </Link>
            </div>
          </div>

          {/* Tareas y Eventos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mis Tareas */}
            <div className="bg-gradient-to-br from-white to-teal-50 rounded-2xl border border-teal-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                    <ClipboardCheck className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Mis Tareas
                  </h2>
                </div>
                <Link 
                  href="/empleado/tareas" 
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              {stats.tareas?.pendientes && stats.tareas.pendientes > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                    <div className="p-2 bg-teal-500 rounded-lg">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-900 mb-1">
                        {stats.tareas.pendientes} {stats.tareas.pendientes === 1 ? 'tarea' : 'tareas'}
                      </p>
                      <p className="text-sm text-slate-600">Requieren tu atención</p>
                    </div>
                  </div>
                  <Link 
                    href="/empleado/tareas" 
                    className="block w-full text-center py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Ir a mis tareas
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-emerald-100 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">¡Todo al día!</p>
                  <p className="text-sm text-slate-500">No tienes tareas pendientes</p>
                </div>
              )}
            </div>

            {/* Próximos Eventos */}
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Próximos Eventos
                  </h2>
                </div>
                <Link 
                  href="/empleado/eventos" 
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              {eventos && eventos.length > 0 ? (
                <div className="space-y-3">
                  {eventos.slice(0, 3).map((evento) => (
                    <div key={evento.id} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate mb-1">
                          {evento.titulo}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(evento.fecha_evento).toLocaleDateString('es-AR', { 
                            day: 'numeric', 
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  ))}
                  <Link 
                    href="/empleado/eventos" 
                    className="block w-full text-center py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 mt-4"
                  >
                    Ver calendario completo
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">Sin eventos</p>
                  <p className="text-sm text-slate-500 mb-4">No hay eventos próximos</p>
                  <Link 
                    href="/empleado/eventos" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white text-sm font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Ver calendario
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
