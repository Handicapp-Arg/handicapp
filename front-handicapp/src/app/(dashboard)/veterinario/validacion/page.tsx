'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  Loader2
} from 'lucide-react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { toast } from 'react-hot-toast';

export default function ValidacionEventosPage() {
  const [eventos, setEventos] = useState<RegistroMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'pendientes' | 'validados' | 'todos'>('pendientes');
  const [validando, setValidando] = useState<number | null>(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await historialMedicoService.getEventosMedicos({});
      setEventos(data);
    } catch (error) {
      console.error('Error cargando eventos:', error);
      toast.error('Error al cargar eventos médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleValidar = async (eventoId: number) => {
    const observaciones = prompt('Observaciones de validación (opcional):');
    if (observaciones === null) return; // Usuario canceló
    
    try {
      setValidando(eventoId);
      await historialMedicoService.validarEvento(eventoId, observaciones || undefined);
      toast.success('Evento validado exitosamente');
      cargarEventos();
    } catch (error) {
      console.error('Error al validar evento:', error);
      toast.error('Error al validar el evento');
    } finally {
      setValidando(null);
    }
  };

  const eventosFiltrados = eventos.filter(evento => {
    if (filtro === 'pendientes') return !evento.validado;
    if (filtro === 'validados') return evento.validado;
    return true;
  });

  const stats = {
    total: eventos.length,
    pendientes: eventos.filter(e => !e.validado).length,
    validados: eventos.filter(e => e.validado).length,
    criticos: eventos.filter(e => !e.validado && e.gravedad === 'critico').length
  };

  const getGravedadBadge = (gravedad?: string) => {
    const badges = {
      leve: 'bg-blue-100 text-blue-800',
      moderado: 'bg-yellow-100 text-yellow-800',
      grave: 'bg-orange-100 text-orange-800',
      critico: 'bg-red-100 text-red-800'
    };
    return badges[gravedad as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['veterinario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo veterinarios pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              ✅ Validación de Eventos Médicos
            </h1>
            <p className="text-gray-600">
              Revisa y valida los registros médicos pendientes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <div className="h-14 w-14 bg-gray-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendientes}</p>
                </div>
                <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validados</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.validados}</p>
                </div>
                <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Críticos</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.criticos}</p>
                </div>
                <div className="h-14 w-14 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFiltro('pendientes')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'pendientes'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes ({stats.pendientes})
              </button>
              <button
                onClick={() => setFiltro('validados')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'validados'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Validados ({stats.validados})
              </button>
              <button
                onClick={() => setFiltro('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtro === 'todos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({stats.total})
              </button>
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="space-y-4">
            {eventosFiltrados.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-6xl mb-4">
                  {filtro === 'pendientes' ? '✅' : '📋'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filtro === 'pendientes' 
                    ? 'No hay eventos pendientes de validación' 
                    : `No hay eventos ${filtro}`}
                </h3>
                <p className="text-gray-600">
                  {filtro === 'pendientes' 
                    ? '¡Excelente trabajo! Todos los eventos están validados' 
                    : 'Cambia el filtro para ver otros eventos'}
                </p>
              </div>
            ) : (
              eventosFiltrados.map((evento) => (
                <div
                  key={evento.id}
                  className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
                    !evento.validado 
                      ? evento.gravedad === 'critico'
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-orange-200'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {evento.titulo}
                        </h3>
                        
                        {evento.validado ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Validado
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pendiente
                          </span>
                        )}

                        {evento.gravedad && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGravedadBadge(evento.gravedad)}`}>
                            {evento.gravedad}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        {evento.tipo_consulta && (
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Tipo:</span>
                            <span className="capitalize">{evento.tipo_consulta}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">Fecha:</span>
                          <span>{new Date(evento.fecha_evento).toLocaleDateString('es-AR')}</span>
                        </div>

                        {evento.caballo && (
                          <div className="flex items-center gap-2">
                            <span>🐎</span>
                            <span className="font-medium">Paciente:</span>
                            <Link 
                              href={`/veterinario/caballos/${evento.caballo_id}`}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              {evento.caballo.nombre}
                            </Link>
                          </div>
                        )}

                        {evento.diagnostico && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900 mb-1">Diagnóstico:</p>
                            <p className="text-gray-700">{evento.diagnostico}</p>
                          </div>
                        )}

                        {evento.tratamiento && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <p className="font-medium text-gray-900 mb-1">Tratamiento:</p>
                            <p className="text-gray-700">{evento.tratamiento}</p>
                          </div>
                        )}

                        {evento.medicamentos && (
                          <div className="flex items-start gap-2 mt-2">
                            <span className="font-medium">💊 Medicamentos:</span>
                            <span>{evento.medicamentos}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!evento.validado && (
                        <button
                          onClick={() => handleValidar(evento.id)}
                          disabled={validando === evento.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                          {validando === evento.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Validando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Validar
                            </>
                          )}
                        </button>
                      )}
                      
                      <Link
                        href={`/veterinario/historial?evento=${evento.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium text-center"
                      >
                        Ver Detalle
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
