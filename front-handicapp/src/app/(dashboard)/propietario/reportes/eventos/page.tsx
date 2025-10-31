'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronLeft,
  Filter,
  Download,
  FileText,
  X,
  Loader2
} from 'lucide-react';
import { useEventos } from '@/lib/hooks/useEventosQuery';
import { generarPDFEventos, generarExcelEventos, type ReporteEventosData } from '@/lib/reportService';
import toast from 'react-hot-toast';
import { logger } from '@/lib/utils/logger';

type Formato = 'pdf' | 'excel';

export default function ReportesEventosPage() {
  const router = useRouter();
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [tipoEvento, setTipoEvento] = useState('');
  const [estadoEvento, setEstadoEvento] = useState('');
  const [generando, setGenerando] = useState(false);

  const limpiarFiltros = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoEvento('');
    setEstadoEvento('');
  };

  // Obtener eventos
  const { data: eventosData } = useEventos({ limit: 1000 });
  
  const eventos = useMemo(() => Array.isArray(eventosData) ? eventosData : eventosData?.data || [], [eventosData]);

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento: {fecha_evento: string; tipo_evento?: {nombre?: string}; estado: string}) => {
      const fechaEvento = new Date(evento.fecha_evento);
      
      if (fechaDesde && fechaEvento < new Date(fechaDesde)) return false;
      if (fechaHasta && fechaEvento > new Date(fechaHasta)) return false;
      if (tipoEvento && evento.tipo_evento?.nombre !== tipoEvento) return false;
      if (estadoEvento && evento.estado !== estadoEvento) return false;
      
      return true;
    });
  }, [eventos, fechaDesde, fechaHasta, tipoEvento, estadoEvento]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    return {
      total: eventosFiltrados.length,
      pendientes: eventosFiltrados.filter((e: {estado: string}) => e.estado === 'pendiente').length,
      completados: eventosFiltrados.filter((e: {estado: string}) => e.estado === 'completado').length,
      cancelados: eventosFiltrados.filter((e: {estado: string}) => e.estado === 'cancelado').length,
    };
  }, [eventosFiltrados]);

  const generarReporte = async (formato: Formato) => {
    setGenerando(true);
    const toastId = toast.loading(`Generando reporte ${formato.toUpperCase()}...`);

    try {
      const data: ReporteEventosData = {
        eventos: eventosFiltrados.map((e: {titulo: string; fecha_evento: string; tipo_evento?: {nombre?: string}; estado: string; caballo?: {nombre?: string}; ubicacion?: string}) => ({
          titulo: e.titulo,
          fecha_evento: e.fecha_evento,
          tipo: e.tipo_evento?.nombre || 'Sin tipo',
          estado: e.estado,
          caballo_nombre: e.caballo?.nombre || 'Sin caballo',
          ubicacion: e.ubicacion,
        })),
        estadisticas,
        periodo: fechaDesde && fechaHasta 
          ? `${new Date(fechaDesde).toLocaleDateString('es-AR')} - ${new Date(fechaHasta).toLocaleDateString('es-AR')}`
          : 'Todos los períodos',
      };

      const config = {
        titulo: 'Reporte de Eventos',
        subtitulo: data.periodo,
      };

      let blob: Blob;
      if (formato === 'pdf') {
        blob = await generarPDFEventos(data, config);
      } else {
        blob = await generarExcelEventos(data);
      }

      // Descargar archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-eventos-${Date.now()}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Reporte generado exitosamente', { id: toastId });
    } catch (error) {
      console.error('Error generando reporte:', error);
      toast.error('Error al generar el reporte', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  const tiposEvento = [
    'Vacunación',
    'Desparasitación',
    'Herrado',
    'Consulta Veterinaria',
    'Entrenamiento',
    'Competencia',
    'Baño',
    'Limpieza de Box',
  ];

  const estadosEvento = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completado', label: 'Completado' },
    { value: 'cancelado', label: 'Cancelado' },
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
                <Calendar className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Reportes de Eventos
                </h1>
                <p className="text-gray-600 text-sm">
                  Consulta el historial completo de eventos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h2>
          </div>
          {(fechaDesde || fechaHasta || tipoEvento || estadoEvento) && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-brand-gold hover:text-brand-gold/80 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Evento
            </label>
            <select
              value={tipoEvento}
              onChange={(e) => setTipoEvento(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {tiposEvento.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={estadoEvento}
              onChange={(e) => setEstadoEvento(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              {estadosEvento.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Resumen de Eventos Filtrados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Eventos
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900">{estadisticas.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-amber-600">{estadisticas.pendientes}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{estadisticas.completados}</div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{estadisticas.cancelados}</div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => generarReporte('pdf')}
            disabled={generando || eventosFiltrados.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Descargar PDF
          </button>

          <button
            onClick={() => generarReporte('excel')}
            disabled={generando || eventosFiltrados.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generando ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Descargar Excel
          </button>
        </div>

        {eventosFiltrados.length === 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <FileText className="w-5 h-5" />
              <p className="text-sm">
                No hay eventos que coincidan con los filtros seleccionados.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">📊</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reportes Detallados
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Los reportes incluyen todos los eventos filtrados con información completa</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Exporta a PDF para compartir con veterinarios o establecimientos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Exporta a Excel para análisis avanzados y gráficos personalizados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Usa los filtros para generar reportes específicos por período o tipo</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
