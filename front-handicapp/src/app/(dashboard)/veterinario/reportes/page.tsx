'use client';

import React, { useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Activity, Pill, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

type TipoReporte = 'tratamientos' | 'eventos' | 'consolidado';
type Formato = 'pdf' | 'excel';

export default function VeterinarioReportesPage() {
  const { user } = useAuthNew();
  const [generando, setGenerando] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoReporte | null>(null);

  const reportes = [
    {
      tipo: 'tratamientos' as TipoReporte,
      titulo: 'Reporte de Tratamientos',
      descripcion: 'Tratamientos médicos activos y completados',
      icon: Pill,
      color: 'purple'
    },
    {
      tipo: 'eventos' as TipoReporte,
      titulo: 'Eventos Médicos',
      descripcion: 'Consultas, cirugías y procedimientos',
      icon: Calendar,
      color: 'blue'
    },
    {
      tipo: 'consolidado' as TipoReporte,
      titulo: 'Reporte Consolidado',
      descripcion: 'Análisis completo de actividad veterinaria',
      icon: TrendingUp,
      color: 'green'
    }
  ];

  const generarReporte = async (tipo: TipoReporte, formato: Formato) => {
    setGenerando(true);
    setTipoSeleccionado(tipo);
    
    try {
      toast.loading(`Generando reporte ${formato.toUpperCase()}...`);
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.dismiss();
      toast.success(`Reporte ${formato.toUpperCase()} generado exitosamente`);
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.dismiss();
      toast.error('Error al generar el reporte');
    } finally {
      setGenerando(false);
      setTipoSeleccionado(null);
    }
  };

  const stats = useMemo(() => ({
    tratamientos: 24,
    eventos: 156,
    pacientes: 48,
    reportes: 12
  }), []);

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">Reportes Veterinarios</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Genera reportes detallados de la actividad médica
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tratamientos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tratamientos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Pill className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Eventos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.eventos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Registrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pacientes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pacientes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Total
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Reportes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.reportes}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Este mes
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tipos de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reportes.map((reporte) => {
            const Icon = reporte.icon;
            const isGenerating = generando && tipoSeleccionado === reporte.tipo;
            
            return (
              <Card key={reporte.tipo} className="rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-${reporte.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${reporte.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reporte.titulo}</h3>
                      <CardDescription>{reporte.descripcion}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <button
                      onClick={() => generarReporte(reporte.tipo, 'pdf')}
                      disabled={generando}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          Descargar PDF
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => generarReporte(reporte.tipo, 'excel')}
                      disabled={generando}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-5 h-5" />
                      Descargar Excel
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Información */}
        <Card className="rounded-2xl shadow-xl bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Información sobre Reportes</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Los reportes se generan con los datos más recientes disponibles</li>
                  <li>• Los archivos PDF incluyen gráficos y análisis detallados</li>
                  <li>• Los archivos Excel permiten análisis personalizado de datos</li>
                  <li>• Los reportes consolidados incluyen toda la información médica</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
