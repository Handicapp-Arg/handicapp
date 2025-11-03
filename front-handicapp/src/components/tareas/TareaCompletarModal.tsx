/**
 * Modal para completar una tarea con observaciones
 */

'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Loader2, Clock, FileText } from 'lucide-react';
import { tareaService, Tarea } from '@/lib/services/tareaService';
import { toast } from 'react-hot-toast';

interface TareaCompletarModalProps {
  tarea: Tarea;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TareaCompletarModal({ tarea, isOpen, onClose, onSuccess }: TareaCompletarModalProps) {
  const [loading, setLoading] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [tiempoReal, setTiempoReal] = useState<string>(
    tarea.tiempo_estimado_minutos?.toString() || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await tareaService.complete(
        tarea.id,
        observaciones || undefined,
        tiempoReal ? parseInt(tiempoReal) : undefined
      );
      toast.success('✅ Tarea completada exitosamente');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al completar tarea:', error);
      toast.error(error.message || 'Error al completar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Completar Tarea</h3>
              <p className="text-sm text-gray-600">{tarea.titulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Contenido */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Info de la tarea */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900 capitalize">{tarea.tipo.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Prioridad:</span>
                <span className={`font-medium capitalize ${
                  tarea.prioridad === 'critica' ? 'text-red-600' :
                  tarea.prioridad === 'alta' ? 'text-orange-600' :
                  tarea.prioridad === 'media' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {tarea.prioridad}
                </span>
              </div>
              {tarea.tiempo_estimado_minutos && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiempo Estimado:</span>
                  <span className="font-medium text-gray-900">{tarea.tiempo_estimado_minutos} min</span>
                </div>
              )}
            </div>

            {/* Tiempo real */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo Real (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={tiempoReal}
                onChange={(e) => setTiempoReal(e.target.value)}
                placeholder="¿Cuánto tiempo tomó?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional: Registra el tiempo real que tomó completar la tarea
              </p>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Observaciones
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                rows={4}
                placeholder="¿Hubo algo relevante durante la ejecución de la tarea?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Opcional: Agrega cualquier observación o nota importante
              </p>
            </div>

            {/* Alerta */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <span className="font-medium">Nota:</span> Al completar esta tarea, se generará una notificación automática para el creador de la tarea.
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Completar Tarea
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
