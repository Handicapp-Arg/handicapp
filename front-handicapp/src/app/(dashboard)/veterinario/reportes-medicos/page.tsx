'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { reportesMedicosService, ReporteMedicoCompleto } from '@/lib/reportesMedicosService';
import { caballoService } from '@/lib/services/caballoService';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Activity, Heart, TrendingUp, Stethoscope } from 'lucide-react';

interface Caballo {
  id: number;
  nombre: string;
  raza?: string;
}

export default function VeterinarioReportesMedicosPage() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [selectedCaballo, setSelectedCaballo] = useState<number | null>(null);
  const [reporte, setReporte] = useState<ReporteMedicoCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingReporte, setLoadingReporte] = useState(false);

  useEffect(() => {
    loadCaballos();
  }, []);

  const loadCaballos = async () => {
    try {
      setLoading(true);
      const response = await caballoService.getAll();
      const caballosData = Array.isArray(response) 
        ? response 
        : (response as any)?.data?.caballos || (response as any)?.data || [];
      setCaballos(caballosData);
    } catch (err) {
      console.error('Error cargando caballos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReporte = async (caballoId: number) => {
    try {
      setLoadingReporte(true);
      const reporteData = await reportesMedicosService.getReporteMedicoCompleto(caballoId);
      setReporte(reporteData);
    } catch (err) {
      console.error('Error al cargar el reporte médico:', err);
    } finally {
      setLoadingReporte(false);
    }
  };

  const handleSelectCaballo = (caballoId: number) => {
    setSelectedCaballo(caballoId);
    loadReporte(caballoId);
  };

  const handleDownloadPDF = async () => {
    if (!selectedCaballo) return;
    try {
      await reportesMedicosService.generarPDFReporte(selectedCaballo);
    } catch (err) {
      console.error('Error al generar PDF:', err);
    }
  };

  const stats = useMemo(() => {
    if (!reporte) return { consultas: 0, tratamientos: 0, vacunas: 0, total: 0 };
    
    return {
      consultas: reporte.consultas?.length || 0,
      tratamientos: reporte.tratamientos?.length || 0,
      vacunas: reporte.vacunaciones?.length || 0,
      total: (reporte.consultas?.length || 0) + (reporte.tratamientos?.length || 0) + (reporte.vacunaciones?.length || 0)
    };
  }, [reporte]);

  const selectedCaballoData = caballos.find(c => c.id === selectedCaballo);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white">Reportes Médicos</h1>
              </div>
              {selectedCaballo && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar PDF
                </button>
              )}
            </div>
            <p className="text-slate-300 text-lg">
              Reportes médicos completos de cada paciente
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Registros</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Eventos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Consultas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.consultas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Médicas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tratamientos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tratamientos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Activos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vacunaciones</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.vacunas}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Aplicadas
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Caballos */}
          <Card className="lg:col-span-1 rounded-2xl shadow-xl">
            <CardHeader>
              <h3 className="font-semibold text-lg">Pacientes ({caballos.length})</h3>
              <CardDescription>Selecciona un paciente para ver su reporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {caballos.map((caballo) => (
                  <button
                    key={caballo.id}
                    onClick={() => handleSelectCaballo(caballo.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedCaballo === caballo.id
                        ? 'bg-purple-100 border-2 border-purple-600 shadow-md'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedCaballo === caballo.id ? 'bg-purple-600' : 'bg-gray-300'
                      }`}>
                        <span className="text-white text-sm">🐎</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{caballo.nombre}</p>
                        <p className="text-sm text-gray-600 truncate">{caballo.raza || 'Sin raza'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reporte Médico */}
          <div className="lg:col-span-2">
            {selectedCaballo ? (
              <Card className="rounded-2xl shadow-xl">
                <div className="p-6 border-b border-gray-200 bg-purple-50 rounded-t-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCaballoData?.nombre}
                      </h2>
                      <p className="text-gray-600">
                        Reporte médico completo - {selectedCaballoData?.raza || 'Sin raza'}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {loadingReporte ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : !reporte ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No se pudo cargar el reporte médico</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Consultas */}
                      {reporte.consultas && reporte.consultas.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-purple-600" />
                            Consultas ({reporte.consultas.length})
                          </h3>
                          <div className="space-y-2">
                            {reporte.consultas.slice(0, 5).map((consulta: any, idx: number) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{consulta.motivo || 'Consulta médica'}</p>
                                    <p className="text-sm text-gray-600 mt-1">{consulta.diagnostico || 'Sin diagnóstico'}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(consulta.fecha).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tratamientos */}
                      {reporte.tratamientos && reporte.tratamientos.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-purple-600" />
                            Tratamientos ({reporte.tratamientos.length})
                          </h3>
                          <div className="space-y-2">
                            {reporte.tratamientos.slice(0, 5).map((tratamiento: any, idx: number) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{tratamiento.titulo}</p>
                                    <p className="text-sm text-gray-600 mt-1">{tratamiento.descripcion || 'Sin descripción'}</p>
                                    <Badge variant="outline" className="mt-2">{tratamiento.estado}</Badge>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(tratamiento.fecha_inicio).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vacunaciones */}
                      {reporte.vacunaciones && reporte.vacunaciones.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Vacunaciones ({reporte.vacunaciones.length})
                          </h3>
                          <div className="space-y-2">
                            {reporte.vacunaciones.slice(0, 5).map((vacuna: any, idx: number) => (
                              <div key={idx} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{vacuna.vacuna || 'Vacuna'}</p>
                                    <p className="text-sm text-gray-600 mt-1">Lote: {vacuna.lote || 'N/A'}</p>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(vacuna.fecha).toLocaleDateString('es-AR')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-2xl shadow-xl">
                <CardContent className="p-12 text-center">
                  <FileText className="w-20 h-20 text-purple-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona un paciente
                  </h3>
                  <p className="text-gray-600">
                    Elige un caballo de la lista para ver su reporte médico completo
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
