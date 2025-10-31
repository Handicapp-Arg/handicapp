'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, AlertCircle } from 'lucide-react';
import { establecimientoService } from '@/lib/services/establecimientoService';
import { useToaster } from '@/components/ui/toaster';
import { CaballoEstablecimiento } from '@/lib/services/caballoService';

interface SolicitudesPendientesProps {
  solicitudes: CaballoEstablecimiento[];
  tipo: 'propietario' | 'establecimiento'; // Quien recibe la solicitud
  onRefresh?: () => void;
}

export default function SolicitudesPendientes({ solicitudes, tipo, onRefresh }: SolicitudesPendientesProps) {
  const queryClient = useQueryClient();
  const { toast } = useToaster();
  const [motivoRechazo, setMotivoRechazo] = useState<{ [key: number]: string }>({});
  const [mostrarMotivo, setMostrarMotivo] = useState<number | null>(null);

  const aprobarMutation = useMutation({
    mutationFn: async ({ establecimientoId, caballoId }: { establecimientoId: number; caballoId: number }) => {
      return establecimientoService.aprobarAsociacion(establecimientoId, caballoId);
    },
    onSuccess: () => {
      toast('Solicitud aprobada exitosamente', 'success');
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      queryClient.invalidateQueries({ queryKey: ['establecimientos'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes-pendientes'] });
      onRefresh?.();
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al aprobar solicitud';
      toast(errorMessage, 'error');
    },
  });

  const rechazarMutation = useMutation({
    mutationFn: async ({ 
      establecimientoId, 
      caballoId, 
      motivo 
    }: { 
      establecimientoId: number; 
      caballoId: number; 
      motivo?: string;
    }) => {
      return establecimientoService.rechazarAsociacion(establecimientoId, caballoId, motivo);
    },
    onSuccess: () => {
      toast('Solicitud rechazada', 'success');
      setMostrarMotivo(null);
      queryClient.invalidateQueries({ queryKey: ['caballos'] });
      queryClient.invalidateQueries({ queryKey: ['establecimientos'] });
      queryClient.invalidateQueries({ queryKey: ['solicitudes-pendientes'] });
      onRefresh?.();
    },
    onError: (error: Error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al rechazar solicitud';
      toast(errorMessage, 'error');
    },
  });

  const handleAprobar = (solicitud: CaballoEstablecimiento) => {
    aprobarMutation.mutate({
      establecimientoId: solicitud.establecimiento_id,
      caballoId: solicitud.caballo_id,
    });
  };

  const handleRechazar = (solicitud: CaballoEstablecimiento) => {
    rechazarMutation.mutate({
      establecimientoId: solicitud.establecimiento_id,
      caballoId: solicitud.caballo_id,
      motivo: motivoRechazo[solicitud.id] || undefined,
    });
  };

  const solicitudesPendientes = solicitudes.filter(s => s.estado_asociacion === 'pending');

  if (solicitudesPendientes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600">No hay solicitudes pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-900">Solicitudes Pendientes</h3>
          <p className="text-sm text-blue-700">
            {tipo === 'propietario' 
              ? 'Tienes solicitudes de establecimientos para asociar tus caballos'
              : 'Tienes solicitudes de propietarios para asociar caballos a tu establecimiento'
            }
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {solicitudesPendientes.map((solicitud) => (
          <div key={solicitud.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">Pendiente de aprobación</span>
                </div>

                {tipo === 'propietario' ? (
                  // Propietario ve solicitudes de establecimientos
                  <>
                    <h4 className="font-semibold text-gray-900">{solicitud.establecimiento?.nombre}</h4>
                    <p className="text-sm text-gray-600">
                      Solicita asociar tu caballo <span className="font-medium">{solicitud.caballo?.nombre}</span>
                    </p>
                  </>
                ) : (
                  // Establecimiento ve solicitudes de propietarios
                  <>
                    <h4 className="font-semibold text-gray-900">{solicitud.propietario?.nombre} {solicitud.propietario?.apellido}</h4>
                    <p className="text-sm text-gray-600">
                      Solicita asociar el caballo <span className="font-medium">{solicitud.caballo?.nombre}</span>
                      {solicitud.caballo?.raza && <span className="text-gray-500"> ({solicitud.caballo.raza})</span>}
                    </p>
                  </>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  {solicitud.fecha_solicitud && (
                    <>Solicitado el {new Date(solicitud.fecha_solicitud).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</>
                  )}
                </p>

                {mostrarMotivo === solicitud.id && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motivo del rechazo (opcional)
                    </label>
                    <textarea
                      value={motivoRechazo[solicitud.id] || ''}
                      onChange={(e) => setMotivoRechazo({ ...motivoRechazo, [solicitud.id]: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Ej: No tenemos boxes disponibles en este momento"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {mostrarMotivo === solicitud.id ? (
                  <>
                    <button
                      onClick={() => handleRechazar(solicitud)}
                      disabled={rechazarMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Confirmar Rechazo
                    </button>
                    <button
                      onClick={() => setMostrarMotivo(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleAprobar(solicitud)}
                      disabled={aprobarMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      <Check className="h-4 w-4" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => setMostrarMotivo(solicitud.id)}
                      disabled={rechazarMutation.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
