'use client';

import { useState, useEffect } from 'react';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
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
} from 'lucide-react';
import { analyticsService, SystemStats, ActivityData, GrowthData } from '@/lib/analyticsService';
import { Badge } from '@/components/ui/badge';

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
    } catch (err: any) {
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
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'No se pudieron cargar las estadísticas'}
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(...activityData.map(d => Math.max(d.usuarios, d.eventos, d.tareas)));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Métricas</h1>
          <p className="text-gray-600 mt-1">
            Dashboard completo de estadísticas y rendimiento del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadAnalytics}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Datos
          </button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usuarios */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-1">
            <p className="text-blue-100 text-sm font-medium">Total Usuarios</p>
            <p className="text-3xl font-bold">{stats.usuarios.total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {stats.usuarios.activos} activos
              </span>
              <span className="text-blue-100">
                +{stats.usuarios.nuevosUltimoMes} este mes
              </span>
            </div>
          </div>
        </div>

        {/* Caballos */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-2xl">🐴</span>
          </div>
          <div className="space-y-1">
            <p className="text-green-100 text-sm font-medium">Total Caballos</p>
            <p className="text-3xl font-bold">{stats.caballos.total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {stats.establecimientos.total} establecimientos
              </span>
              <span className="text-green-100">
                +{stats.caballos.nuevosUltimoMes} nuevos
              </span>
            </div>
          </div>
        </div>

        {/* Eventos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-2xl">📅</span>
          </div>
          <div className="space-y-1">
            <p className="text-purple-100 text-sm font-medium">Total Eventos</p>
            <p className="text-3xl font-bold">{stats.eventos.total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {stats.eventos.ultimaSemana} esta semana
              </span>
              <span className="text-purple-100">
                {stats.eventos.porTipo.length} tipos
              </span>
            </div>
          </div>
        </div>

        {/* Tareas */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-2xl">✓</span>
          </div>
          <div className="space-y-1">
            <p className="text-orange-100 text-sm font-medium">Total Tareas</p>
            <p className="text-3xl font-bold">{stats.tareas.total}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {stats.tareas.completadas} completadas
              </span>
              <span className="text-orange-100">
                {stats.tareas.pendientes} pendientes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de Usuarios por Rol */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Usuarios por Rol</h2>
          </div>
          <div className="space-y-3">
            {stats.usuarios.porRol
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
              .map((rol, index) => {
                const percentage = (rol.count / stats.usuarios.total) * 100;
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-yellow-500',
                  'bg-red-500',
                  'bg-gray-500',
                ];
                const color = colors[index % colors.length];

                return (
                  <div key={rol.rol}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{rol.rol}</span>
                      <span className="text-sm text-gray-600">
                        {rol.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Estado de Tareas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Estado de Tareas</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tareas.completadas}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((stats.tareas.completadas / stats.tareas.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tareas.enProceso}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((stats.tareas.enProceso / stats.tareas.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tareas.pendientes}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {((stats.tareas.pendientes / stats.tareas.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Actividad de los Últimos 30 Días */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Actividad Diaria (Últimos 30 Días)</h2>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-gray-600">Usuarios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600">Eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-gray-600">Tareas</span>
            </div>
          </div>
        </div>

        <div className="relative h-64">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map((val) => (
              <div key={val} className="border-t border-gray-200" />
            ))}
          </div>

          {/* Chart bars */}
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {activityData.slice(-30).map((data, index) => {
              const usuariosHeight = (data.usuarios / maxActivity) * 100;
              const eventosHeight = (data.eventos / maxActivity) * 100;
              const tareasHeight = (data.tareas / maxActivity) * 100;

              return (
                <div key={index} className="flex-1 flex items-end justify-center gap-0.5 group relative">
                  <div
                    className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${usuariosHeight}%`, width: '30%' }}
                  />
                  <div
                    className="bg-green-500 rounded-t hover:bg-green-600 transition-colors"
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
      </div>

      {/* Eventos por Tipo */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Distribución de Eventos por Tipo</h2>
        </div>
        <div className="space-y-3">
          {stats.eventos.porTipo
            .sort((a, b) => b.count - a.count)
            .map((tipo, index) => {
              const percentage = (tipo.count / stats.eventos.total) * 100;
              const colors = [
                { bg: 'bg-blue-500', text: 'text-blue-700' },
                { bg: 'bg-green-500', text: 'text-green-700' },
                { bg: 'bg-purple-500', text: 'text-purple-700' },
                { bg: 'bg-orange-500', text: 'text-orange-700' },
                { bg: 'bg-red-500', text: 'text-red-700' },
              ];
              const color = colors[index % colors.length];

              return (
                <div key={tipo.tipo} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700 truncate" title={tipo.tipo}>
                    {tipo.tipo}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-8 flex items-center">
                      <div
                        className={`${color.bg} h-8 rounded-full transition-all duration-500 flex items-center justify-end px-3`}
                        style={{ width: `${percentage}%`, minWidth: '60px' }}
                      >
                        <span className="text-white text-xs font-medium">
                          {tipo.count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Crecimiento Mensual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Crecimiento en los Últimos 12 Meses</h2>
        </div>
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
                          <span className={`text-xs ${analyticsService.getGrowthColor(usuariosGrowth)}`}>
                            {analyticsService.getGrowthIcon(usuariosGrowth)}
                            {Math.abs(usuariosGrowth).toFixed(0)}%
                          </span>
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
      </div>

      {/* Métricas de Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Último Día</p>
              <p className="text-2xl font-bold text-gray-900">{stats.auditoria.ultimoDia}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Actividad en las últimas 24 horas</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
        </div>
      </div>
    </div>
  );
}
