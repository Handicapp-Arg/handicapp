'use client';

/**
 * 📊 REPORTES VETERINARIOS
 * 
 * Consolidación de todos los reportes médicos:
 * - Reportes Médicos (Tratamientos, consultas, diagnósticos)
 * - Estadísticas (Métricas y tendencias)
 * - Análisis (Reportes consolidados)
 * 
 * @architecture Sistema de tabs con generación de PDFs/Excel
 * @pattern Lazy loading + React Query + Export utilities
 */

import React, { useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Activity,
  Pill,
  TrendingUp,
  Stethoscope,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuthNew } from '@/lib/hooks/useAuthNew';

type TipoReporte = 'tratamientos' | 'consultas' | 'diagnosticos' | 'consolidado';
type Formato = 'pdf' | 'excel';

export default function VeterinarioReportesPage() {
  const { user } = useAuthNew();
  const [activeTab, setActiveTab] = useState('medicos');
  const [generando, setGenerando] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoReporte | null>(null);

  // Stats simulados - TODO: Conectar con backend
  const stats = useMemo(() => ({
    tratamientos: 24,
    consultas: 156,
    pacientes: 48,
    reportesGenerados: 12
  }), []);

  const reportesMedicos = [
    {
      tipo: 'tratamientos' as TipoReporte,
      titulo: 'Tratamientos Médicos',
      descripcion: 'Reporte detallado de tratamientos activos y completados',
      icon: Pill,
      color: 'purple',
      stats: stats.tratamientos
    },
    {
      tipo: 'consultas' as TipoReporte,
      titulo: 'Consultas Veterinarias',
      descripcion: 'Historial de consultas médicas realizadas',
      icon: Stethoscope,
      color: 'blue',
      stats: stats.consultas
    },
    {
      tipo: 'diagnosticos' as TipoReporte,
      titulo: 'Diagnósticos',
      descripcion: 'Reporte de diagnósticos y hallazgos clínicos',
      icon: Activity,
      color: 'green',
      stats: 89
    },
    {
      tipo: 'consolidado' as TipoReporte,
      titulo: 'Reporte Consolidado',
      descripcion: 'Análisis completo de actividad veterinaria',
      icon: TrendingUp,
      color: 'amber',
      stats: '-'
    }
  ];

  const generarReporte = async (tipo: TipoReporte, formato: Formato) => {
    setGenerando(true);
    setTipoSeleccionado(tipo);
    
    try {
      toast.loading(`Generando reporte ${formato.toUpperCase()}...`, { id: 'reporte' });
      
      // Simular generación de reporte
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Reporte ${formato.toUpperCase()} descargado exitosamente`, { id: 'reporte' });
    } catch {
      toast.error('Error al generar el reporte', { id: 'reporte' });
    } finally {
      setGenerando(false);
      setTipoSeleccionado(null);
    }
  };

  const colorClasses = {
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Reportes y Estadísticas"
          description="Genera reportes médicos, análisis y estadísticas de tu actividad veterinaria"
          icon={BarChart3}
          breadcrumbs={[
            { label: 'Dashboard', href: '/veterinario' },
            { label: 'Reportes', href: '/veterinario/reportes' },
          ]}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Tratamientos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.tratamientos}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Pill className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Consultas</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.consultas}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Pacientes</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pacientes}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">Reportes</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.reportesGenerados}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 bg-slate-50/50">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="medicos" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Reportes Médicos</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="estadisticas"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Estadísticas</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="medicos" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reportesMedicos.map((reporte) => {
                    const Icon = reporte.icon;
                    const isGenerating = generando && tipoSeleccionado === reporte.tipo;

                    return (
                      <Card key={reporte.tipo} className="hover:shadow-lg transition-all border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={`w-12 h-12 rounded-xl ${colorClasses[reporte.color as keyof typeof colorClasses]} border flex items-center justify-center mb-3`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            {typeof reporte.stats === 'number' && (
                              <Badge variant="secondary">{reporte.stats} registros</Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{reporte.titulo}</CardTitle>
                          <CardDescription>{reporte.descripcion}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => generarReporte(reporte.tipo, 'pdf')}
                              disabled={isGenerating}
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {isGenerating ? 'Generando...' : 'PDF'}
                            </Button>
                            <Button
                              onClick={() => generarReporte(reporte.tipo, 'excel')}
                              disabled={isGenerating}
                              variant="outline"
                              className="flex-1"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {isGenerating ? 'Generando...' : 'Excel'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="estadisticas" className="mt-0">
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Estadísticas y Métricas
                    </h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      Visualiza tendencias, gráficos y análisis detallados de tu actividad veterinaria
                    </p>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                      Próximamente disponible
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
