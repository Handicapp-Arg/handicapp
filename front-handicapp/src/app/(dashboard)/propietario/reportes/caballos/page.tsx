'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Filter,
  Search,
  X,
  FileSpreadsheet,
  Loader2,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { Caballo } from '@/lib/services/caballoService';
import { 
  generarPDFCaballo, 
  generarExcelCaballo, 
  descargarArchivo,
  formatearFechaReporte,
  CaballoReportData,
  ReportConfig
} from '@/lib/reportService';
import { toast } from 'react-hot-toast';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import caballoService from '@/lib/services/caballoService';

export default function ReportesCaballosPage() {
  const router = useRouter();
  const { data: caballosData = [], isLoading: loading } = useCaballos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRaza, setSelectedRaza] = useState('');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [generatingReport, setGeneratingReport] = useState<number | null>(null);
  const [selectedCaballos, setSelectedCaballos] = useState<Set<number>>(new Set());

  // Normalizar datos de caballos
  const caballos = useMemo(() => {
    if (Array.isArray(caballosData)) return caballosData;
    return (caballosData as { data?: { caballos?: Caballo[] } })?.data?.caballos || [];
  }, [caballosData]);

  // Filtrar caballos con useMemo
  const filteredCaballos = useMemo(() => {
    let filtered = [...caballos];

    if (searchTerm) {
      filtered = filtered.filter((caballo: Caballo) =>
        caballo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caballo.microchip?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRaza) {
      filtered = filtered.filter((caballo: Caballo) => caballo.raza === selectedRaza);
    }

    if (selectedDisciplina) {
      filtered = filtered.filter((caballo: Caballo) => caballo.disciplina === selectedDisciplina);
    }

    return filtered;
  }, [caballos, searchTerm, selectedRaza, selectedDisciplina]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setSelectedRaza('');
    setSelectedDisciplina('');
  };

  const toggleSeleccionCaballo = (id: number) => {
    const newSelected = new Set(selectedCaballos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCaballos(newSelected);
  };

  const seleccionarTodos = () => {
    if (selectedCaballos.size === filteredCaballos.length) {
      setSelectedCaballos(new Set());
    } else {
      setSelectedCaballos(new Set(filteredCaballos.map(c => c.id)));
    }
  };

  const generarReporte = async (caballo: Caballo, formato: 'pdf' | 'excel') => {
    try {
      setGeneratingReport(caballo.id);
      
      // Obtener datos completos del caballo
      const response = await caballoService.getById(caballo.id);
      const caballoCompleto = (response as { data?: Caballo })?.data || caballo;
      
      // TODO: Cuando tengamos el endpoint de eventos, cargar los eventos reales
      type EventoReporte = { estado: string; [key: string]: unknown };
      const eventos: EventoReporte[] = [];
      
      const reportData: CaballoReportData = {
        caballo: caballoCompleto,
        eventos: eventos.slice(0, 50), // Limitar a últimos 50 eventos
        estadisticas: {
          totalEventos: eventos.length,
          eventosPendientes: eventos.filter((e) => e.estado === 'pendiente').length,
          eventosCompletados: eventos.filter((e) => e.estado === 'completado').length,
          ultimaActualizacion: formatearFechaReporte(new Date(caballoCompleto.actualizado_el || new Date())),
        },
      };

      const config: ReportConfig = {
        title: `Reporte de ${caballo.nombre}`,
        subtitle: 'Información completa del caballo',
        author: 'Sistema Handicapp',
        date: formatearFechaReporte(new Date()),
      };

      let blob: Blob;
      let nombreArchivo: string;

      if (formato === 'pdf') {
        blob = await generarPDFCaballo(reportData, config);
        nombreArchivo = `Reporte_${caballo.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      } else {
        blob = await generarExcelCaballo(reportData, config);
        nombreArchivo = `Reporte_${caballo.nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
      }

      descargarArchivo(blob, nombreArchivo);
      toast.success(`Reporte ${formato.toUpperCase()} generado exitosamente`);
    } catch {
      toast.error('Error al generar el reporte');
    } finally {
      setGeneratingReport(null);
    }
  };

  const generarReporteMultiple = async (formato: 'pdf' | 'excel') => {
    if (selectedCaballos.size === 0) {
      toast.error('Selecciona al menos un caballo');
      return;
    }

    toast.success(`Generando ${selectedCaballos.size} reportes...`);
    
    for (const caballoId of Array.from(selectedCaballos)) {
      const caballo = caballos.find((c: Caballo) => c.id === caballoId);
      if (caballo) {
        await generarReporte(caballo, formato);
        // Pequeña pausa entre reportes
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const razasUnicas = Array.from(new Set(caballos.map((c: Caballo) => c.raza).filter(Boolean))) as string[];
  const disciplinasUnicas = Array.from(new Set(caballos.map((c: Caballo) => c.disciplina).filter(Boolean))) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando caballos...</p>
        </div>
      </div>
    );
  }

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
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Reportes de Caballos
                </h1>
                <p className="text-gray-600 text-sm">
                  Genera reportes detallados de tus caballos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de selección múltiple */}
      {selectedCaballos.size > 0 && (
        <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-brand-gold" />
              <span className="text-sm font-medium text-gray-900">
                {selectedCaballos.size} caballo{selectedCaballos.size !== 1 && 's'} seleccionado{selectedCaballos.size !== 1 && 's'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generarReporteMultiple('pdf')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generar PDFs
              </button>
              <button
                onClick={() => generarReporteMultiple('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Generar Excels
              </button>
              <button
                onClick={() => setSelectedCaballos(new Set())}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          {(searchTerm || selectedRaza || selectedDisciplina) && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-brand-gold hover:text-brand-gold/80 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o microchip..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raza
            </label>
            <select
              value={selectedRaza}
              onChange={(e) => setSelectedRaza(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              <option value="">Todas las razas</option>
              {razasUnicas.map((raza) => raza && (
                <option key={raza} value={raza}>
                  {raza}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina
            </label>
            <select
              value={selectedDisciplina}
              onChange={(e) => setSelectedDisciplina(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              <option value="">Todas las disciplinas</option>
              {disciplinasUnicas.map((disciplina) => disciplina && (
                <option key={disciplina} value={disciplina}>
                  {disciplina}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{filteredCaballos.length}</span> de{' '}
            <span className="font-semibold">{caballos.length}</span> caballos
          </p>
          <button
            onClick={seleccionarTodos}
            className="text-sm text-brand-gold hover:text-brand-gold/80 font-medium"
          >
            {selectedCaballos.size === filteredCaballos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>

      {/* Lista de Caballos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCaballos.size === filteredCaballos.length && filteredCaballos.length > 0}
                    onChange={seleccionarTodos}
                    className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Caballo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Raza
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Disciplina
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Microchip
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCaballos.map((caballo) => (
                <tr
                  key={caballo.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCaballos.has(caballo.id)}
                      onChange={() => toggleSeleccionCaballo(caballo.id)}
                      className="w-4 h-4 text-brand-gold border-gray-300 rounded focus:ring-brand-gold"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/propietario/caballos/${caballo.id}`}
                      className="font-medium text-brand-dark hover:text-brand-gold transition-colors"
                    >
                      {caballo.nombre}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {caballo.raza || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {caballo.disciplina || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {caballo.microchip || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => generarReporte(caballo, 'pdf')}
                        disabled={generatingReport === caballo.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Exportar a PDF"
                      >
                        {generatingReport === caballo.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => generarReporte(caballo, 'excel')}
                        disabled={generatingReport === caballo.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Exportar a Excel"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCaballos.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron caballos
              </h3>
              <p className="text-sm text-gray-600">
                {searchTerm || selectedRaza || selectedDisciplina
                  ? 'Intenta ajustar los filtros'
                  : 'No tienes caballos registrados'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
