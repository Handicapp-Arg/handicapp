'use client';

import { useState, useEffect } from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import {
  TrendingUp,
  Users,
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Building2,
} from 'lucide-react';
import { analyticsService, SystemStats, ActivityData, GrowthData } from '@/lib/analyticsService';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activityDataRes, growthDataRes] = await Promise.all([
        analyticsService.getSystemStats(),
        analyticsService.getActivityData(30),
        analyticsService.getGrowthData(),
      ]);

      setStats(statsData);
      setActivityData(activityDataRes);
      setGrowthData(growthDataRes);
    } catch (err) {
      setError('Error al cargar analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!stats) return;

    const data = {
      generado: new Date().toISOString(),
      periodo: '30d',
      estadisticas: stats,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinnerFullPage />;
  }

  if (error || !stats) {
    return (
      <SimpleAdminOnly>
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Error al cargar analytics</p>
                  <p className="text-sm text-red-600 mt-1">{error || 'No se pudieron cargar las estadísticas'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SimpleAdminOnly>
    );
  }

  const maxActivity = Math.max(...activityData.map(d => Math.max(d.usuarios, d.eventos, d.tareas)));

  return (
    <SimpleAdminOnly>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        {/* Hero Section - Simple como Gestión de Personal */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 overflow-hidden">
          <div className="relative px-6 py-12 max-w-[1800px] mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Analytics & Métricas del Sistema
                </h1>
                <p className="text-slate-200">
                  Monitoreo completo de la plataforma en tiempo real
                </p>
              </div>
              <button
                onClick={loadAnalytics}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 
                         text-white rounded-lg border border-white/20 backdrop-blur-sm
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                type="button"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 py-8 space-y-8 max-w-[1800px] mx-auto">
          
          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Usuarios */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                    +{stats.usuarios.nuevosUltimoMes}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.usuarios.total}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      {stats.usuarios.activos} activos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Caballos */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    +{stats.caballos.nuevosUltimoMes}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Caballos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.caballos.total}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="w-4 h-4" />
                    <span>{stats.establecimientos.total} establecimientos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                    Últimos 7d
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.eventos.total}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stats.eventos.ultimaSemana} esta semana</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tareas */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                    {Math.round((stats.tareas.completadas / stats.tareas.total) * 100)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.tareas.total}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {stats.tareas.completadas}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      {stats.tareas.pendientes}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights de Negocio - Cards Normales */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Insights de Negocio</h2>
                <p className="text-sm text-gray-600">Métricas clave para toma de decisiones</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Crecimiento de Usuarios */}
              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      Mes actual
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Crecimiento de Usuarios</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    +{stats.usuarios.nuevosUltimoMes}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.usuarios.total > 0 
                      ? ((stats.usuarios.nuevosUltimoMes / stats.usuarios.total) * 100).toFixed(1)
                      : 0}% del total
                  </p>
                </CardContent>
              </Card>

              {/* Tasa de Actividad */}
              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                      Activos
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Actividad</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.usuarios.total > 0 
                      ? ((stats.usuarios.activos / stats.usuarios.total) * 100).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.usuarios.activos} usuarios activos
                  </p>
                </CardContent>
              </Card>

              {/* Eficiencia de Tareas */}
              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                      Completadas
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Eficiencia de Tareas</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.tareas.total > 0 
                      ? ((stats.tareas.completadas / stats.tareas.total) * 100).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.tareas.completadas} de {stats.tareas.total}
                  </p>
                </CardContent>
              </Card>

              {/* Caballos por Establecimiento */}
              <Card className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                      <Building2 className="w-6 h-6 text-amber-600" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                      Promedio
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Caballos/Establecimiento</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {stats.establecimientos.total > 0 
                      ? (stats.caballos.total / stats.establecimientos.total).toFixed(1)
                      : 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.establecimientos.total} establecimientos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stats adicionales en cards pequeñas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-600 mb-1">Eventos/Semana</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.eventos.ultimaSemana}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-600 mb-1">Actividad/Día</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.auditoria.ultimoDia)}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-600 mb-1">Nuevos Caballos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.caballos.nuevosUltimoMes}</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-gray-600 mb-1">Tipos de Eventos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.eventos.porTipo.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botón Exportar */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 
                       text-gray-700 rounded-xl border border-gray-200 shadow-sm
                       transition-all duration-200 font-medium"
              type="button"
            >
              <Download className="w-5 h-5" />
              <span>Exportar Datos</span>
            </button>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usuarios por Rol */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Usuarios por Rol</h3>
                </div>
                <CardDescription>Distribución de usuarios según su rol</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.usuarios.porRol
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 6)
                    .map((rol, index) => {
                      const percentage = (rol.count / stats.usuarios.total) * 100;
                      const colors = [
                        { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
                        { bg: 'bg-emerald-500', text: 'text-emerald-700', light: 'bg-emerald-50' },
                        { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' },
                        { bg: 'bg-amber-500', text: 'text-amber-700', light: 'bg-amber-50' },
                        { bg: 'bg-rose-500', text: 'text-rose-700', light: 'bg-rose-50' },
                        { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-50' },
                      ];
                      const color = colors[index % colors.length];

                      return (
                        <div key={rol.rol}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                              <span className="text-sm font-medium text-gray-700">{rol.rol}</span>
                            </div>
                            <Badge className={`${color.light} ${color.text} border-0`}>
                              {rol.count}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Estado de Tareas */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Estado de Tareas</h3>
                </div>
                <CardDescription>Progreso de tareas en el sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Completadas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.tareas.completadas}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-0">
                      {((stats.tareas.completadas / stats.tareas.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">En Proceso</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.tareas.enProceso}</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      {((stats.tareas.enProceso / stats.tareas.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.tareas.pendientes}</p>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-0">
                      {((stats.tareas.pendientes / stats.tareas.total) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actividad Diaria */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Actividad Diaria</h3>
                    <CardDescription className="mt-1">Últimos 30 días de actividad del sistema</CardDescription>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-gray-600">Usuarios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-gray-600">Eventos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-gray-600">Tareas</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <div key={val} className="border-t border-gray-100" />
                  ))}
                </div>

                {/* Chart bars */}
                <div className="absolute inset-0 flex items-end justify-between gap-1">
                  {activityData.slice(-30).map((data, index) => {
                    const usuariosHeight = maxActivity > 0 ? (data.usuarios / maxActivity) * 100 : 0;
                    const eventosHeight = maxActivity > 0 ? (data.eventos / maxActivity) * 100 : 0;
                    const tareasHeight = maxActivity > 0 ? (data.tareas / maxActivity) * 100 : 0;

                    return (
                      <div key={index} className="flex-1 flex items-end justify-center gap-0.5 group relative">
                        <div
                          className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                          style={{ height: `${usuariosHeight}%`, width: '30%' }}
                        />
                        <div
                          className="bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors"
                          style={{ height: `${eventosHeight}%`, width: '30%' }}
                        />
                        <div
                          className="bg-purple-500 rounded-t hover:bg-purple-600 transition-colors"
                          style={{ height: `${tareasHeight}%`, width: '30%' }}
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
                          <div className="font-medium mb-1">{new Date(data.date).toLocaleDateString('es-AR')}</div>
                          <div>Usuarios: {data.usuarios}</div>
                          <div>Eventos: {data.eventos}</div>
                          <div>Tareas: {data.tareas}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-gray-500">
                  <span>{maxActivity}</span>
                  <span>{Math.floor(maxActivity * 0.75)}</span>
                  <span>{Math.floor(maxActivity * 0.5)}</span>
                  <span>{Math.floor(maxActivity * 0.25)}</span>
                  <span>0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribución de Eventos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Distribución de Eventos</h3>
              </div>
              <CardDescription>Eventos agrupados por tipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.eventos.porTipo
                  .sort((a, b) => b.count - a.count)
                  .map((tipo, index) => {
                    const percentage = (tipo.count / stats.eventos.total) * 100;
                    const colors = [
                      { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700' },
                      { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700' },
                      { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700' },
                      { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700' },
                      { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-700' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={tipo.tipo} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-gray-700 truncate" title={tipo.tipo}>
                          {tipo.tipo}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-100 rounded-full h-8 flex items-center overflow-hidden">
                            <div
                              className={`${color.bg} h-8 rounded-full transition-all duration-500 flex items-center justify-end px-3`}
                              style={{ width: `${percentage}%`, minWidth: '60px' }}
                            >
                              <span className="text-white text-xs font-medium">
                                {tipo.count}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${color.light} ${color.text} border-0`}>
                          {percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>

          {/* Crecimiento Mensual */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Crecimiento Mensual</h3>
              </div>
              <CardDescription>Últimos 12 meses de evolución</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Usuarios</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Caballos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Eventos</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tareas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {growthData.map((data, index) => {
                      const prevData = index > 0 ? growthData[index - 1] : null;
                      const usuariosGrowth = prevData 
                        ? analyticsService.calculateGrowthRate(data.usuarios, prevData.usuarios)
                        : 0;

                      return (
                        <tr key={data.periodo} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{data.periodo}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-gray-900">{data.usuarios}</span>
                              {prevData && (
                                <Badge className={`${analyticsService.getGrowthColor(usuariosGrowth)} border-0 text-xs`}>
                                  {analyticsService.getGrowthIcon(usuariosGrowth)}
                                  {Math.abs(usuariosGrowth).toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{data.caballos}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{data.eventos}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{data.tareas}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Auditoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Acciones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsService.formatNumber(stats.auditoria.totalAcciones)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Registro completo de auditoría</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Último Día</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.auditoria.ultimoDia}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Actividad en las últimas 24 horas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Semana</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.auditoria.ultimaSemana}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Actividad en los últimos 7 días</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
