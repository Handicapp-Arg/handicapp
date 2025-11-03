'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  FileSpreadsheet,
  Activity,
  Package,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useStats } from '@/lib/hooks/useStats';
import { useCaballos } from '@/lib/hooks';
import { inventarioService } from '@/lib/inventarioService';
import { 
  generarReporteCaballosPDF, 
  exportarCaballosExcel, 
  generarReporteInventarioPDF,
  exportarInventarioExcel,
  exportarDatosCompletosExcel,
  generarReporteConsolidadoPDF,
  generarReportePersonalPDF,
  exportarPersonalExcel
} from '@/lib/services/reporteService';
import { toast } from 'react-hot-toast';

type TipoReporte = 'inventario' | 'personal' | 'operaciones' | 'consolidado';

export default function EstablecimientoReportesPage() {
  const [generando, setGenerando] = useState(false);
  const { stats, loading: loadingStats } = useStats();
  const { data: caballosResponse } = useCaballos({ page: 1, limit: 1000 });
  const [productos, setProductos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  // Cargar productos para reporte de inventario
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const data = await inventarioService.getProductos();
        setProductos(data || []);
      } catch (error) {
        console.error('Error loading productos:', error);
      }
    };
    loadProductos();
  }, []);

  // Cargar usuarios para reporte de personal (simulado - ajustar según tu API)
  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        // TODO: Reemplazar con tu servicio de usuarios real
        // const data = await usuarioService.getUsuarios();
        // Por ahora, datos de ejemplo
        setUsuarios([
          { id: 1, nombre: 'Juan', apellido: 'Pérez', email: 'juan@example.com', rol: { nombre: 'Empleado' }, activo: true, creado_el: new Date() },
          { id: 2, nombre: 'María', apellido: 'García', email: 'maria@example.com', rol: { nombre: 'Veterinario' }, activo: true, creado_el: new Date() },
        ]);
      } catch (error) {
        console.error('Error loading usuarios:', error);
      }
    };
    loadUsuarios();
  }, []);

  const statsReportes = useMemo(() => {
    return {
      total: (stats.caballos?.total || 0) + (productos.length || 0) + (stats.tareas?.total || 0),
      generadosHoy: 0, // Se incrementará cuando se generen reportes
      tiposDisponibles: 4,
      ultimaGeneracion: 'No generado aún',
    };
  }, [stats, productos]);

  const caballos = useMemo(() => {
    if (!caballosResponse) return [];
    const data = (caballosResponse as { data?: { caballos?: any[] }; caballos?: any[] });
    return data?.data?.caballos || data?.caballos || [];
  }, [caballosResponse]);

  const reportes = [
    {
      tipo: 'inventario' as TipoReporte,
      titulo: 'Reporte de Inventario',
      descripcion: 'Productos, stock, movimientos y alertas',
      icon: Package,
      color: 'emerald',
    },
    {
      tipo: 'personal' as TipoReporte,
      titulo: 'Reporte de Personal',
      descripcion: 'Empleados, ausencias y estadísticas',
      icon: Users,
      color: 'blue',
    },
    {
      tipo: 'operaciones' as TipoReporte,
      titulo: 'Reporte de Operaciones',
      descripcion: 'Caballos, eventos y tareas',
      icon: Activity,
      color: 'purple',
    },
    {
      tipo: 'consolidado' as TipoReporte,
      titulo: 'Reporte Consolidado',
      descripcion: 'Todas las métricas del establecimiento',
      icon: TrendingUp,
      color: 'orange',
    },
  ];

  const handleGenerarReporte = async (tipo: TipoReporte, formato: 'pdf' | 'excel') => {
    setGenerando(true);
    try {
      if (tipo === 'operaciones') {
        if (formato === 'pdf') {
          await generarReporteCaballosPDF(caballos, {
            titulo: 'Reporte de Operaciones - Caballos',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF generado exitosamente');
        } else {
          exportarCaballosExcel(caballos);
          toast.success('Reporte Excel generado exitosamente');
        }
      } else if (tipo === 'inventario') {
        if (formato === 'pdf') {
          await generarReporteInventarioPDF(productos, {
            titulo: 'Reporte de Inventario',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF de inventario generado');
        } else {
          exportarInventarioExcel(productos);
          toast.success('Reporte Excel de inventario generado');
        }
      } else if (tipo === 'consolidado') {
        if (formato === 'pdf') {
          await generarReporteConsolidadoPDF({
            caballos,
            productos,
            stats
          }, {
            titulo: 'Reporte Consolidado',
            subtitulo: 'Establecimiento - Todas las métricas',
          });
          toast.success('Reporte consolidado PDF generado');
        } else {
          exportarDatosCompletosExcel({ caballos, eventos: [] });
          toast.success('Reporte consolidado Excel generado');
        }
      } else if (tipo === 'personal') {
        if (formato === 'pdf') {
          await generarReportePersonalPDF(usuarios, {
            titulo: 'Reporte de Personal',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF de personal generado');
        } else {
          exportarPersonalExcel(usuarios);
          toast.success('Reporte Excel de personal generado');
        }
      } else {
        toast(`Reporte de ${tipo} en desarrollo`, { icon: '🚧' });
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">Generación de Reportes</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Genera reportes detallados en PDF o Excel
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Datos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loadingStats ? '...' : statsReportes.total}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Disponibles
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Caballos */}
          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Caballos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loadingStats ? '...' : stats.caballos?.total || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Registrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Productos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{productos.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Inventario
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Tareas */}
          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Tareas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loadingStats ? '...' : stats.tareas?.total || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Activas
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  Los reportes se generan con datos actualizados en tiempo real. Puedes descargarlos en formato PDF para visualización o Excel para análisis detallado.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>PDF:</strong> Formato ideal para presentaciones y documentación</li>
                  <li>• <strong>Excel:</strong> Permite análisis personalizado de datos</li>
                  <li>• Los reportes incluyen gráficos y estadísticas relevantes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
