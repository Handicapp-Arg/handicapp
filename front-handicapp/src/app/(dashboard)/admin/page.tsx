'use client';

import React from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { 
  Users, 
  Building2, 
  Circle,
  Calendar,
  Settings,
  BarChart3,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Database
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const { user } = useAuthNew();

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." />;
  }

  const adminNombre = user?.nombre || 'Administrador';
  const today = new Date().toLocaleDateString('es-AR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <SimpleAdminOnly fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Acceso Denegado</h3>
          <p className="text-gray-600">Solo administradores pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        {/* Header Hero - Tema Navy/Gold */}
        <div className="relative bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border-b border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0e445d] rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#af936f] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
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
                  Panel de Administración - {adminNombre}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 capitalize flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Calendar className="h-4 w-4" />
                  {today}
                </p>
              </div>
              <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Link
                  href="/admin/settings"
                  className="group relative px-5 py-3 bg-gradient-to-r from-[#af936f] to-[#8f7657] text-white text-sm font-semibold rounded-lg overflow-hidden transition-all duration-200 flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine"></div>
                  <Shield className="h-5 w-5 relative z-10" />
                  <span className="relative z-10">Configuración</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Usuarios */}
            <div className="group bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1.5 rounded-full">
                  Total
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.empleados?.total || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">Usuarios del Sistema</p>
            </div>

            {/* Establecimientos */}
            <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl border border-emerald-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-shadow">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">
                  Activos
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.establecimientos?.total || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">Establecimientos</p>
            </div>

            {/* Caballos */}
            <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                  <Circle className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-3 py-1.5 rounded-full">
                  Registrados
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {stats.caballos?.total || 0}
              </p>
              <p className="text-sm font-medium text-slate-600">Caballos en Sistema</p>
            </div>

            {/* Eventos */}
            <div className="group bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-100 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:shadow-amber-500/50 transition-shadow">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full">
                  Próximos
                </span>
              </div>
              <p className="text-4xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
                {eventos.length}
              </p>
              <p className="text-sm font-medium text-slate-600">Eventos Programados</p>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'var(--font-outfit)' }}>Acciones de Administración</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link href="/admin/users" className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-blue-400 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-blue-100 rounded-lg mb-3 w-fit group-hover:bg-blue-500 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Usuarios</p>
              </Link>

              <Link href="/admin/establecimientos" className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-emerald-400 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-emerald-100 rounded-lg mb-3 w-fit group-hover:bg-emerald-500 transition-colors">
                  <Building2 className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Establecimientos</p>
              </Link>

              <Link href="/admin/stats" className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-purple-400 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-purple-100 rounded-lg mb-3 w-fit group-hover:bg-purple-500 transition-colors">
                  <BarChart3 className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Estadísticas</p>
              </Link>

              <Link href="/admin/settings" className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-slate-400 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div className="p-2 bg-slate-100 rounded-lg mb-3 w-fit group-hover:bg-slate-500 transition-colors">
                  <Settings className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Configuración</p>
              </Link>
            </div>
          </div>

          {/* Sistema y Eventos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estado del Sistema */}
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Estado del Sistema
                  </h2>
                </div>
                <Link href="/admin/settings" className="text-sm font-semibold text-slate-600 hover:text-slate-700 flex items-center gap-1 transition-colors">
                  Ver detalles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <div className="p-2 bg-emerald-500 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900 mb-1">
                      Sistema Operativo
                    </p>
                    <p className="text-sm text-slate-600">Todos los servicios funcionando correctamente</p>
                  </div>
                </div>
                <Link href="/admin/settings" className="block w-full text-center py-3 bg-gradient-to-r from-slate-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                  Panel de control
                </Link>
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl border border-amber-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-outfit)' }}>
                    Actividad Reciente
                  </h2>
                </div>
                <Link href="/admin/events" className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              {eventos && eventos.length > 0 ? (
                <div className="space-y-3">
                  {eventos.slice(0, 3).map((evento) => (
                    <div key={evento.id} className="group flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <div className="p-2 bg-amber-500 rounded-lg group-hover:bg-amber-600 transition-colors">
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
                      <ArrowRight className="h-4 w-4 text-amber-400 group-hover:text-amber-600 transition-colors" />
                    </div>
                  ))}
                  <Link href="/admin/events" className="block w-full text-center py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 mt-4">
                    Ver toda la actividad
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-4 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-slate-400" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 mb-1">Sin eventos recientes</p>
                  <p className="text-sm text-slate-500 mb-4">No hay actividad para mostrar</p>
                  <Link href="/admin/events" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                    <Plus className="h-4 w-4" />
                    Ver actividad
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
