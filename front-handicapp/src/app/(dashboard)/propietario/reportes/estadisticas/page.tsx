'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ChevronLeft,
  BarChart3,
  Activity,
  Target,
  Award,
  Calendar,
  Heart
} from 'lucide-react';

export default function ReportesEstadisticasPage() {
  const router = useRouter();
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');

  const periodos = [
    { value: 'semana', label: 'Última Semana' },
    { value: 'mes', label: 'Último Mes' },
    { value: 'trimestre', label: 'Último Trimestre' },
    { value: 'año', label: 'Último Año' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Estadísticas y Análisis
                </h1>
                <p className="text-gray-600 text-sm">
                  Métricas y rendimiento de tus caballos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Período */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700 mr-2">Período:</span>
          {periodos.map((periodo) => (
            <button
              key={periodo.value}
              onClick={() => setPeriodoSeleccionado(periodo.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodoSeleccionado === periodo.value
                  ? 'bg-brand-gold text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {periodo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Actividad</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">87%</p>
          <p className="text-xs text-gray-500">Tasa de cumplimiento</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-green-600 font-medium">+12%</span>
            <span className="text-xs text-gray-500 ml-1">vs período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Heart className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Salud</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">95%</p>
          <p className="text-xs text-gray-500">Estado de salud promedio</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-green-600 font-medium">Excelente</span>
            <span className="text-xs text-gray-500 ml-1">Todos los caballos</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Eventos</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">24</p>
          <p className="text-xs text-gray-500">Eventos completados</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-blue-600 font-medium">3 pendientes</span>
            <span className="text-xs text-gray-500 ml-1">esta semana</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Rendimiento</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">A+</p>
          <p className="text-xs text-gray-500">Calificación general</p>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-amber-600 font-medium">Top 10%</span>
            <span className="text-xs text-gray-500 ml-1">en tu región</span>
          </div>
        </div>
      </div>

      {/* Gráficos Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-semibold text-gray-900">
              Eventos por Tipo
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Gráfico en desarrollo</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-brand-gold" />
            <h3 className="text-lg font-semibold text-gray-900">
              Tendencia de Actividad
            </h3>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Gráfico en desarrollo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparativa de Caballos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Comparativa de Caballos
        </h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Tabla comparativa en desarrollo</p>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">📊</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Próximamente - Analytics Avanzados
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Gráficos interactivos de rendimiento y salud</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Comparativas entre caballos y períodos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Predicciones basadas en machine learning</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Reportes de tendencias y recomendaciones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>Benchmarking con otros establecimientos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
