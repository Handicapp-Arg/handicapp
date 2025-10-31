'use client';

import React, { useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSpreadsheet,
  Activity,
  Calendar,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';

type ReportType = 'caballos' | 'eventos' | 'tareas' | 'estadisticas';

export default function CapatazReportesPage() {
  const stats = useMemo(() => {
    return {
      total: 18,
      generadosHoy: 2,
      tiposDisponibles: 4,
      ultimaGeneracion: '3 horas',
    };
  }, []);

  const reportes = [
    {
      tipo: 'caballos' as ReportType,
      titulo: 'Reporte de Caballos',
      descripcion: 'Estado de salud y registro completo',
      icon: Activity,
      color: 'orange',
    },
    {
      tipo: 'eventos' as ReportType,
      titulo: 'Reporte de Eventos',
      descripcion: 'Calendario y seguimiento',
      icon: Calendar,
      color: 'blue',
    },
    {
      tipo: 'tareas' as ReportType,
      titulo: 'Reporte de Tareas',
      descripcion: 'Asignaciones y cumplimiento',
      icon: ClipboardList,
      color: 'purple',
    },
    {
      tipo: 'estadisticas' as ReportType,
      titulo: 'Estadísticas Generales',
      descripcion: 'Métricas y análisis del período',
      icon: TrendingUp,
      color: 'emerald',
    },
  ];

  const handleGenerateReport = (tipo: ReportType, formato: 'pdf' | 'excel') => {
    console.log(`Generando reporte ${tipo} en formato ${formato}`);
  };

  return (
    <SimpleRoleGuard roles={['capataz']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-orange-400" />
              <h1 className="text-3xl font-bold text-white">Generación de Reportes</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Genera reportes operativos en PDF o Excel
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Reportes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Histórico
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Generados Hoy */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Generados Hoy</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.generadosHoy}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Últimas 24 horas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tipos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tipos Disponibles</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tiposDisponibles}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Categorías
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Última Generación */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Última Generación</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">Hace {stats.ultimaGeneracion}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Reciente
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reportes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportes.map((reporte) => {
            const Icon = reporte.icon;
            return (
              <Card key={reporte.tipo} className="rounded-2xl shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl bg-${reporte.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${reporte.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{reporte.titulo}</h3>
                      <CardDescription>{reporte.descripcion}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGenerateReport(reporte.tipo, 'pdf')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Generar PDF</span>
                    </button>
                    <button
                      onClick={() => handleGenerateReport(reporte.tipo, 'excel')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                      <span>Generar Excel</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="rounded-2xl shadow-xl bg-gradient-to-br from-orange-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información sobre Reportes</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Genera reportes operativos con datos actualizados para análisis y toma de decisiones.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>PDF:</strong> Visualización profesional para presentaciones</li>
                  <li>• <strong>Excel:</strong> Análisis detallado con tablas dinámicas</li>
                  <li>• Incluye gráficos, estadísticas y métricas clave</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
