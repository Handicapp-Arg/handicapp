'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  ChevronLeft,
  Filter,
  TrendingUp,
  Wallet,
  PieChart,
  X,
  Download,
  Loader2
} from 'lucide-react';
import { useEventos } from '@/lib/hooks/useEventosQuery';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { generarPDFGastos, generarExcelGastos, type ReporteGastosData } from '@/lib/reportService';
import toast from 'react-hot-toast';

type Formato = 'pdf' | 'excel';

export default function ReportesGastosPage() {
  const router = useRouter();
  const [mes, setMes] = useState('');
  const [categoria, setCategoria] = useState('');
  const [generando, setGenerando] = useState(false);

  const limpiarFiltros = () => {
    setMes('');
    setCategoria('');
  };

  const categorias = [
    'Veterinaria',
    'Alimentación',
    'Herrado',
    'Entrenamiento',
    'Competencias',
    'Transporte',
    'Equipamiento',
    'Alojamiento',
    'Otros',
  ];

  // Obtener eventos (que contienen costos estimados)
  const { data: eventosData, isLoading } = useEventos({ limit: 1000 });
  const { data: caballosData } = useCaballos({ limit: 100 });

  const eventos = useMemo(() => Array.isArray(eventosData) ? eventosData : eventosData?.data || [], [eventosData]);
  const caballos = useMemo(() => Array.isArray(caballosData) ? caballosData : (caballosData as {data?: unknown[]})?.data || [], [caballosData]);

  // Calcular gastos desde eventos
  const gastosCalculados = useMemo(() => {
    const gastosPorCategoria: Record<string, { monto: number; cantidad: number }> = {};

    eventos.forEach((evento: {tipo_evento?: {nombre?: string}; fecha_evento: string}) => {
      // Estimar costo según tipo de evento
      const categoria = categorizarEvento(evento.tipo_evento?.nombre || 'Otros');
      const costoEstimado = estimarCosto(evento.tipo_evento?.nombre || '');

      if (!gastosPorCategoria[categoria]) {
        gastosPorCategoria[categoria] = { monto: 0, cantidad: 0 };
      }
      gastosPorCategoria[categoria].monto += costoEstimado;
      gastosPorCategoria[categoria].cantidad += 1;
    });

    const total = Object.values(gastosPorCategoria).reduce((sum, g) => sum + g.monto, 0);
    const colores = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500', 'bg-gray-500'];

    return Object.entries(gastosPorCategoria).map(([cat, data], index) => ({
      categoria: cat,
      monto: data.monto,
      cantidad: data.cantidad,
      porcentaje: total > 0 ? Math.round((data.monto / total) * 100) : 0,
      color: colores[index % colores.length],
    })).sort((a, b) => b.monto - a.monto);
  }, [eventos]);

  const totalGastos = gastosCalculados.reduce((sum, g) => sum + g.monto, 0);
  const promedioMensual = Math.round(totalGastos / 6); // Estimado últimos 6 meses

  // Categorizar evento
  const categorizarEvento = (tipo: string): string => {
    const lower = tipo.toLowerCase();
    if (lower.includes('vacu') || lower.includes('desparasit') || lower.includes('veterinar') || lower.includes('consulta')) return 'Veterinaria';
    if (lower.includes('aliment') || lower.includes('comida')) return 'Alimentación';
    if (lower.includes('herr')) return 'Herrado';
    if (lower.includes('entrena')) return 'Entrenamiento';
    if (lower.includes('compet') || lower.includes('carrera')) return 'Competencias';
    if (lower.includes('transport')) return 'Transporte';
    if (lower.includes('equip')) return 'Equipamiento';
    if (lower.includes('alojam') || lower.includes('box')) return 'Alojamiento';
    return 'Otros';
  };

  // Estimar costo según tipo
  const estimarCosto = (tipo: string): number => {
    const lower = tipo.toLowerCase();
    if (lower.includes('vacu')) return 5000;
    if (lower.includes('desparasit')) return 3000;
    if (lower.includes('veterinar') || lower.includes('consulta')) return 15000;
    if (lower.includes('herr')) return 7500;
    if (lower.includes('entrena')) return 10000;
    if (lower.includes('compet')) return 25000;
    if (lower.includes('transport')) return 8000;
    if (lower.includes('equip')) return 12000;
    if (lower.includes('aliment')) return 4000;
    return 5000;
  };

  // Generar reporte
  const generarReporte = async (formato: Formato) => {
    setGenerando(true);
    const toastId = toast.loading(`Generando reporte ${formato.toUpperCase()}...`);

    try {
      const data: ReporteGastosData = {
        gastos: gastosCalculados.map(g => ({
          categoria: g.categoria,
          monto: g.monto,
          cantidad_eventos: g.cantidad,
          porcentaje: g.porcentaje,
        })),
        totalGastos,
        promedioMensual,
        mesAnalisis: mes || new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long' }),
        caballos: caballos.length,
      };

      const config = {
        titulo: 'Reporte de Gastos',
        subtitulo: mes ? `Mes: ${new Date(mes).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })}` : 'Todos los períodos',
      };

      let blob: Blob;
      if (formato === 'pdf') {
        blob = await generarPDFGastos(data, config);
      } else {
        blob = await generarExcelGastos(data);
      }

      // Descargar archivo
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-gastos-${Date.now()}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Reporte generado exitosamente', { id: toastId });
    } catch {
      toast.error('Error al generar el reporte', { id: toastId });
    } finally {
      setGenerando(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
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
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Reportes de Gastos
                </h1>
                <p className="text-gray-600 text-sm">
                  Analiza los gastos de tus caballos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total del Mes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${totalGastos.toLocaleString('es-AR')}
          </p>
          <div className="flex items-center gap-1 mt-2 text-xs">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-green-600 font-medium">8.2%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Mayor Gasto</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Veterinaria</p>
          <p className="text-xs text-gray-500 mt-2">
            $45,000 (30% del total)
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Promedio Mensual</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">$142,500</p>
          <p className="text-xs text-gray-500 mt-2">
            Últimos 6 meses
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          {(mes || categoria) && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-brand-gold hover:text-brand-gold/80 font-medium flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Distribución de Gastos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución de Gastos
        </h2>
        <div className="space-y-3">
          {gastosCalculados.map((gasto: {categoria: string; monto: number; porcentaje: number; color: string}) => (
            <div key={gasto.categoria}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {gasto.categoria}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  ${gasto.monto.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${gasto.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${gasto.porcentaje}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones de Descarga */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Exportar Reporte
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => generarReporte('pdf')}
            disabled={generando}
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
            disabled={generando}
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
        <p className="text-sm text-gray-500 mt-4">
          Los gastos se calculan en base a los eventos registrados y costos estimados por tipo de servicio.
        </p>
      </div>

      {/* Información */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">ℹ️</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sobre los Gastos Calculados
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Los montos se calculan automáticamente según los eventos registrados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Cada tipo de evento tiene un costo estimado promedio del mercado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Los reportes PDF y Excel contienen información detallada y gráficos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Próximamente: Registro manual de gastos con comprobantes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}