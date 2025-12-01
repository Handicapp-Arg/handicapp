'use client';

import React, { useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStats } from '@/lib/hooks/useStats';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { useEventos } from '@/lib/hooks/useEventosQuery';
import toast from 'react-hot-toast';
import {
  FileText,
  FileSpreadsheet,
  Activity,
  TrendingUp,
} from 'lucide-react';

type TipoReporte = 'caballos' | 'eventos' | 'consolidado';

export default function PropietarioReportesPage() {
  const [generando, setGenerando] = useState(false);
  const { stats } = useStats();
  const { data: caballosData } = useCaballos();
  const { data: eventosData } = useEventos();

  // Extraer datos reales
  const caballos = Array.isArray((caballosData as any)?.data?.caballos) 
    ? (caballosData as any).data.caballos 
    : Array.isArray((caballosData as any)?.caballos) 
      ? (caballosData as any).caballos 
      : Array.isArray((caballosData as any)?.data) 
        ? (caballosData as any).data 
        : Array.isArray(caballosData) 
          ? caballosData 
          : [];

  const eventos = Array.isArray((eventosData as any)?.data) 
    ? (eventosData as any).data 
    : Array.isArray(eventosData) 
      ? eventosData 
      : [];

  // Calcular datos totales
  const totalDatos = caballos.length + eventos.length;
  const tiposDisponibles = 3;

  const reportes = [
    {
      tipo: 'caballos' as TipoReporte,
      titulo: 'Reporte de Mis Caballos',
      descripcion: 'Estado, historial médico y rendimiento',
      icon: Activity,
      color: 'blue',
    },
    {
      tipo: 'eventos' as TipoReporte,
      titulo: 'Reporte de Eventos',
      descripcion: 'Competencias, entrenamientos y resultados',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      tipo: 'consolidado' as TipoReporte,
      titulo: 'Reporte Consolidado',
      descripcion: 'Resumen general de tus caballos y actividades',
      icon: FileText,
      color: 'emerald',
    },
  ];

  const handleGenerarReporte = async (tipo: TipoReporte, formato: 'pdf' | 'excel') => {
    setGenerando(true);
    // Simulación de generación
    setTimeout(() => {
      setGenerando(false);
      toast.success(`Reporte ${tipo} en formato ${formato} generado`);
    }, 2000);
  };

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Generación de Reportes</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Genera reportes detallados sobre tus caballos y actividades en PDF o Excel
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Datos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Datos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalDatos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Caballos + Eventos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Caballos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Mis Caballos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.caballos?.total || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {stats.caballos?.activos || 0} Activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Eventos */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Eventos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.eventos?.total || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  {stats.eventos?.programados || 0} Programados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tipos Disponibles */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tipos Disponibles</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{tiposDisponibles}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                  Reportes
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
                      onClick={() => handleGenerarReporte(reporte.tipo, 'pdf')}
                      disabled={generando}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Generar PDF</span>
                    </button>
                    <button
                      onClick={() => handleGenerarReporte(reporte.tipo, 'excel')}
                      disabled={generando}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
        <Card className="rounded-2xl shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Información sobre Reportes</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Los reportes se generan con datos actualizados en tiempo real sobre tus caballos y actividades. Puedes descargarlos en formato PDF para visualización o Excel para análisis detallado.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Mis Caballos:</strong> Estado de salud, historial médico y rendimiento</li>
                  <li>• <strong>Eventos:</strong> Competencias, entrenamientos y resultados</li>
                  <li>• <strong>Consolidado:</strong> Resumen completo de todas tus actividades</li>
                  <li>• <strong>PDF:</strong> Formato ideal para presentaciones y documentación</li>
                  <li>• <strong>Excel:</strong> Permite análisis personalizado de datos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
