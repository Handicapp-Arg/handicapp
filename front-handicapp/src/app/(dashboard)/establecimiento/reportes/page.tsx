'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  FileSpreadsheet,
  Package,
  Users,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
} from 'lucide-react';
import { useStats } from '@/lib/hooks/useStats';
import { useCaballos } from '@/lib/hooks';
import { inventarioService } from '@/lib/inventarioService';
import { gestionPersonalService, type Empleado } from '@/lib/gestionPersonalService';
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
  const [reporteExpandido, setReporteExpandido] = useState<TipoReporte | null>(null);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  
  const { stats } = useStats();
  const { data: caballosResponse } = useCaballos({ page: 1, limit: 1000 });
  
  interface Producto {
    id: number;
    nombre: string;
    categoria?: { nombre: string };
    cantidad: number;
    stock_minimo?: number;
    unidad_medida?: string;
  }
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  // Cargar productos
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const data = await inventarioService.getProductos();
        setProductos((data || []) as unknown as Producto[]);
      } catch {
        setProductos([]);
      }
    };
    loadProductos();
  }, []);

  // Cargar empleados reales
  useEffect(() => {
    const loadEmpleados = async () => {
      try {
        const data = await gestionPersonalService.getEmpleados();
        setEmpleados(data || []);
      } catch {
        setEmpleados([]);
      }
    };
    loadEmpleados();
  }, []);

  interface CaballoData {
    id: number;
    nombre: string;
    raza: string;
    edad: number;
    sexo?: string;
    pelaje?: string;
  }

  const caballos = useMemo(() => {
    if (!caballosResponse) return [];
    const data = caballosResponse as { 
      data?: { caballos?: CaballoData[] }; 
      caballos?: CaballoData[] 
    };
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

  // Generar reporte directamente
  const handleGenerarReporte = async (tipo: TipoReporte, formato: 'pdf' | 'excel') => {
    setGenerando(true);
    
    try {
      if (tipo === 'operaciones') {
        if (formato === 'pdf') {
          await generarReporteCaballosPDF(caballos as unknown as any[], {
            titulo: 'Reporte de Operaciones - Caballos',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF generado exitosamente');
        } else {
          exportarCaballosExcel(caballos as unknown as any[]);
          toast.success('Reporte Excel generado exitosamente');
        }
      } else if (tipo === 'inventario') {
        if (formato === 'pdf') {
          await generarReporteInventarioPDF(productos as unknown as any[], {
            titulo: 'Reporte de Inventario',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF de inventario generado');
        } else {
          exportarInventarioExcel(productos as unknown as any[]);
          toast.success('Reporte Excel de inventario generado');
        }
      } else if (tipo === 'consolidado') {
        if (formato === 'pdf') {
          await generarReporteConsolidadoPDF({
            caballos: caballos as unknown as any[],
            productos: productos as unknown as any[],
            stats
          }, {
            titulo: 'Reporte Consolidado',
            subtitulo: 'Establecimiento - Todas las métricas',
          });
          toast.success('Reporte consolidado PDF generado');
        } else {
          exportarDatosCompletosExcel({ caballos: caballos as unknown as any[], eventos: [] });
          toast.success('Reporte consolidado Excel generado');
        }
      } else if (tipo === 'personal') {
        // Transformar empleados a formato compatible con los reportes
        const usuariosParaReporte = empleados.map(emp => ({
          id: emp.id,
          nombre: emp.nombre,
          apellido: emp.apellido,
          email: emp.email,
          telefono: emp.telefono,
          activo: emp.estado === 'activo',
          rol: { 
            id: emp.rol_id, 
            nombre: emp.rol_nombre,
            clave: emp.rol_nombre.toLowerCase()
          }
        }));
        
        if (formato === 'pdf') {
          await generarReportePersonalPDF(usuariosParaReporte as unknown as any[], {
            titulo: 'Reporte de Personal',
            subtitulo: 'Establecimiento',
          });
          toast.success('Reporte PDF de personal generado');
        } else {
          exportarPersonalExcel(usuariosParaReporte as unknown as any[]);
          toast.success('Reporte Excel de personal generado');
        }
      } else {
        toast(`Reporte de ${tipo} en desarrollo`, { icon: '🚧' });
      }
    } catch {
      toast.error('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header */}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visualiza los datos y descarga reportes en PDF o Excel
          </p>
        </div>

        {/* Lista de Reportes con Tablas Expandibles */}
        <div className="space-y-3">
          {reportes.map((reporte) => {
            const Icon = reporte.icon;
            const isExpanded = reporteExpandido === reporte.tipo;
            const colorClasses: Record<string, string> = {
              emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              blue: 'bg-blue-50 text-blue-700 border-blue-200',
              purple: 'bg-purple-50 text-purple-700 border-purple-200',
              orange: 'bg-orange-50 text-orange-700 border-orange-200',
            };
            
            return (
              <Card key={reporte.tipo} className={isExpanded ? 'ring-2 ring-blue-200' : ''}>
                <CardContent className="p-0">
                  {/* Header del Reporte */}
                  <div className="p-3 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Izquierda: Info + Toggle */}
                    <button
                      onClick={() => setReporteExpandido(isExpanded ? null : reporte.tipo)}
                      className="flex items-center gap-2 sm:gap-3 flex-1 text-left group min-w-0"
                    >
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClasses[reporte.color]}`}>
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                          {reporte.titulo}
                        </h3>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                          {reporte.descripcion}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      )}
                    </button>

                    {/* Derecha: Botones de Descarga */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleGenerarReporte(reporte.tipo, 'pdf')}
                        disabled={generando}
                        className="p-2 sm:p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        title="Descargar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGenerarReporte(reporte.tipo, 'excel')}
                        disabled={generando}
                        className="p-2 sm:p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                        title="Descargar Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contenido Expandible */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-3 sm:p-4 space-y-4">
                      {/* Filtros de Fecha */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <input
                            type="date"
                            value={fechaDesde}
                            onChange={(e) => setFechaDesde(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Desde"
                          />
                          <span className="text-sm text-gray-500 flex-shrink-0">hasta</span>
                          <input
                            type="date"
                            value={fechaHasta}
                            onChange={(e) => setFechaHasta(e.target.value)}
                            className="flex-1 min-w-[120px] px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Hasta"
                          />
                          {(fechaDesde || fechaHasta) && (
                            <button
                              onClick={() => {
                                setFechaDesde('');
                                setFechaHasta('');
                              }}
                              className="text-sm text-gray-600 hover:text-gray-900 underline whitespace-nowrap"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                          <Download className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {reporte.tipo === 'inventario' && `${productos.length} productos`}
                            {reporte.tipo === 'personal' && `${empleados.length} empleados`}
                            {reporte.tipo === 'operaciones' && `${caballos.length} caballos`}
                            {reporte.tipo === 'consolidado' && 'Datos completos'}
                          </span>
                        </div>
                      </div>

                      {/* Tabla de Datos */}
                      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {/* Inventario */}
                        {reporte.tipo === 'inventario' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Producto</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Categoría</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">Stock Actual</th>
                                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">Stock Mín.</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {productos.length > 0 ? (
                                  productos.slice(0, 100).map((producto) => {
                                    const stockBajo = producto.stock_minimo && producto.cantidad < producto.stock_minimo;
                                    return (
                                      <tr key={producto.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5 font-medium text-gray-900">{producto.nombre}</td>
                                        <td className="px-4 py-2.5 text-gray-600">
                                          {producto.categoria?.nombre || 'Sin categoría'}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-900">
                                          {producto.cantidad} {producto.unidad_medida || 'un'}
                                        </td>
                                        <td className="px-4 py-2.5 text-right text-gray-600">
                                          {producto.stock_minimo || '-'}
                                        </td>
                                        <td className="px-4 py-2.5 text-center">
                                          {stockBajo ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              Bajo
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              OK
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                      No hay productos disponibles
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {productos.length > 100 && (
                              <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 text-center">
                                Mostrando 100 de {productos.length} productos
                              </div>
                            )}
                          </div>
                        )}

                        {/* Personal */}
                        {reporte.tipo === 'personal' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Nombre</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Email</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Rol</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {empleados.length > 0 ? (
                                  empleados.map((empleado: Empleado) => (
                                    <tr key={empleado.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2.5 font-medium text-gray-900">
                                        {empleado.nombre} {empleado.apellido}
                                      </td>
                                      <td className="px-4 py-2.5 text-gray-600">{empleado.email}</td>
                                      <td className="px-4 py-2.5 text-gray-600">{empleado.rol_nombre || 'Sin rol'}</td>
                                      <td className="px-4 py-2.5 text-center">
                                        {empleado.estado === 'activo' ? (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Activo
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {empleado.estado.charAt(0).toUpperCase() + empleado.estado.slice(1)}
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                                      No hay personal disponible
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Operaciones (Caballos) */}
                        {reporte.tipo === 'operaciones' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Caballo</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Raza</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Sexo</th>
                                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-700">Edad</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">Pelaje</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {caballos.length > 0 ? (
                                  caballos.slice(0, 100).map((caballo) => (
                                    <tr key={caballo.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2.5 font-medium text-gray-900">{caballo.nombre}</td>
                                      <td className="px-4 py-2.5 text-gray-600">{caballo.raza}</td>
                                      <td className="px-4 py-2.5 text-gray-600">{caballo.sexo || '-'}</td>
                                      <td className="px-4 py-2.5 text-center text-gray-900">{caballo.edad} años</td>
                                      <td className="px-4 py-2.5 text-gray-600">{caballo.pelaje || '-'}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                      No hay caballos disponibles
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {caballos.length > 100 && (
                              <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600 text-center">
                                Mostrando 100 de {caballos.length} caballos
                              </div>
                            )}
                          </div>
                        )}

                        {/* Consolidado */}
                        {reporte.tipo === 'consolidado' && (
                          <div className="p-6">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="text-3xl font-bold text-purple-900">{caballos.length}</div>
                                <div className="text-sm text-purple-700 mt-1">Caballos</div>
                              </div>
                              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                <div className="text-3xl font-bold text-emerald-900">{productos.length}</div>
                                <div className="text-sm text-emerald-700 mt-1">Productos</div>
                              </div>
                              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-3xl font-bold text-blue-900">{stats.tareas?.total || 0}</div>
                                <div className="text-sm text-blue-700 mt-1">Tareas</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                              El reporte consolidado incluye todas las métricas y datos del establecimiento
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-blue-900 text-center">
            <strong>Tip:</strong> Haz clic en un reporte para ver los datos antes de descargar
          </p>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
