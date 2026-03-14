'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Loader2,
  X
} from 'lucide-react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { toast } from 'react-hot-toast';
import TableSkeleton from '@/components/skeletons/TableSkeleton';
import { PageHeader } from '@/components/ui/page-header';

export default function ValidacionEventosPage() {
  const [eventos, setEventos] = useState<RegistroMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'pendientes' | 'validados' | 'todos'>('pendientes');
  const [validando, setValidando] = useState<number | null>(null);
  const [pendingValidarId, setPendingValidarId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await historialMedicoService.getEventosMedicos({});
      setEventos(data);
    } catch {
      toast.error('Error al cargar eventos médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleValidarConfirmar = async () => {
    if (!pendingValidarId) return;
    try {
      setValidando(pendingValidarId);
      await historialMedicoService.validarEvento(pendingValidarId, observaciones || undefined);
      toast.success('Evento validado exitosamente');
      setPendingValidarId(null);
      setObservaciones('');
      cargarEventos();
    } catch {
      toast.error('Error al validar el evento');
    } finally {
      setValidando(null);
    }
  };

  const isPendiente = (e: RegistroMedico) =>
    e.estado_validacion === 'pending_review' || e.estado_validacion === 'draft' || (!e.estado_validacion && !e.validado);
  const isValidado = (e: RegistroMedico) =>
    e.estado_validacion === 'approved' || (!e.estado_validacion && e.validado);

  const eventosFiltrados = eventos.filter(evento => {
    if (filtro === 'pendientes') return isPendiente(evento);
    if (filtro === 'validados') return isValidado(evento);
    return true;
  });

  const stats = {
    total: eventos.length,
    pendientes: eventos.filter(isPendiente).length,
    validados: eventos.filter(isValidado).length,
    criticos: eventos.filter(e => isPendiente(e) && e.gravedad === 'critico').length
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
    return <TableSkeleton rows={6} columns={4} />;
  }

  return (
    <>
    {/* Modal de confirmación de validación */}
    {pendingValidarId && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Confirmar validación</h3>
            <button
              onClick={() => { setPendingValidarId(null); setObservaciones(''); }}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Podés agregar observaciones opcionales antes de validar el evento médico.
          </p>
          <textarea
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            placeholder="Observaciones (opcional)..."
            rows={3}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => { setPendingValidarId(null); setObservaciones(''); }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleValidarConfirmar}
              disabled={!!validando}
              className="flex-1 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {validando ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Validando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" />Validar</>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

    <SimpleRoleGuard roles={['veterinario']}>
      <div className="max-w-[1600px] mx-auto space-y-6">

        <PageHeader
          title="Validación de Eventos Médicos"
          subtitle="Revisa y valida los registros médicos pendientes"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Pendientes</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendientes}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Validados</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.validados}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Críticos</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats.criticos}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('pendientes')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtro === 'pendientes'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendientes ({stats.pendientes})
            </button>
            <button
              onClick={() => setFiltro('validados')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtro === 'validados'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Validados ({stats.validados})
            </button>
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filtro === 'todos'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({stats.total})
            </button>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-3">
          {eventosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_4px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)] p-12 text-center">
              <CheckCircle2 className="w-14 h-14 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {filtro === 'pendientes'
                  ? 'No hay eventos pendientes'
                  : `No hay eventos ${filtro}`}
              </h3>
              <p className="text-sm text-slate-500">
                {filtro === 'pendientes'
                  ? 'Todos los eventos están validados'
                  : 'Cambia el filtro para ver otros eventos'}
              </p>
            </div>
          ) : (
            eventosFiltrados.map((evento) => (
              <div
                key={evento.id}
                className={`bg-white rounded-2xl border-2 p-5 hover:shadow-md transition-shadow ${
                  isPendiente(evento)
                    ? evento.gravedad === 'critico'
                      ? 'border-red-200 bg-red-50/30'
                      : 'border-orange-200'
                    : 'border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <h3 className="text-base font-semibold text-slate-900">
                        {evento.titulo}
                      </h3>

                      {isValidado(evento) ? (
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Validado
                        </span>
                      ) : evento.estado_validacion === 'rejected' ? (
                        <span className="px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Rechazado
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </span>
                      )}

                      {evento.gravedad && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getGravedadBadge(evento.gravedad)}`}>
                          {evento.gravedad}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-slate-600 mb-3">
                      {evento.tipo_consulta && (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">Tipo:</span>
                          <span className="capitalize">{evento.tipo_consulta}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">Fecha:</span>
                        <span>{new Date(evento.fecha_evento).toLocaleDateString('es-AR')}</span>
                      </div>

                      {evento.caballo && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">🐎</span>
                          <span className="font-medium text-slate-700">Paciente:</span>
                          <Link
                            href={`/veterinario/caballos/${evento.caballo_id}`}
                            className="text-purple-600 hover:text-purple-700 hover:underline"
                          >
                            {evento.caballo.nombre}
                          </Link>
                        </div>
                      )}

                      {evento.diagnostico && (
                        <div className="mt-2 p-3 bg-slate-50 rounded-xl">
                          <p className="font-medium text-slate-900 mb-1">Diagnóstico:</p>
                          <p className="text-slate-700">{evento.diagnostico}</p>
                        </div>
                      )}

                      {evento.tratamiento && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-xl">
                          <p className="font-medium text-slate-900 mb-1">Tratamiento:</p>
                          <p className="text-slate-700">{evento.tratamiento}</p>
                        </div>
                      )}

                      {evento.medicamentos && (
                        <div className="flex items-start gap-2 mt-2">
                          <span className="font-medium text-slate-700">💊 Medicamentos:</span>
                          <span>{evento.medicamentos}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {isPendiente(evento) && (
                      <button
                        onClick={() => setPendingValidarId(evento.id)}
                        disabled={!!validando}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Validar
                      </button>
                    )}

                    <Link
                      href={`/veterinario/historial?evento=${evento.id}`}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors text-sm font-medium text-center"
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
    </SimpleRoleGuard>
    </>
  );
}

