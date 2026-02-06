/**
 * Modal para asignar una tarea a un usuario
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Save } from 'lucide-react';
import { tareaService, Tarea } from '@/lib/services/tareaService';
import { userService } from '@/lib/services/userService';
import { showError, showSuccess, showWarning } from '@/lib/utils/errorHandler';
import { Loader } from '@/components/ui/loader';

interface TareaAsignarModalProps {
  tarea: Tarea;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TareaAsignarModal({ tarea, isOpen, onClose, onSuccess }: TareaAsignarModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>(
    tarea.asignado_a_usuario_id?.toString() || ''
  );

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
      setUsuarioSeleccionado(tarea.asignado_a_usuario_id?.toString() || '');
    }
  }, [isOpen, tarea.asignado_a_usuario_id]);

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const usuariosResp = await userService.getAll();
      setUsuarios(usuariosResp.data || []);
    } catch (error) {
      showError(error, 'user', 'fetch_list');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuarioSeleccionado) {
      showWarning('Por favor selecciona un usuario');
      return;
    }

    try {
      setLoading(true);
      await tareaService.assign(tarea.id, parseInt(usuarioSeleccionado));
      showSuccess('tarea', 'assigned');
      onSuccess();
      onClose();
    } catch (error: any) {
      showError(error, 'tarea', 'assign_failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Asignar Tarea</h3>
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
          {loadingUsuarios ? (
            <div className="flex items-center justify-center py-8">
              <Loader variant="section" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario <span className="text-red-500">*</span>
                </label>
                <select
                  value={usuarioSeleccionado}
                  onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                  disabled={loading}
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido} - {usuario.rol?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info actual */}
              {tarea.asignado_a && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Asignado actualmente a:</span>{' '}
                    {tarea.asignado_a.nombre} {tarea.asignado_a.apellido}
                  </p>
                </div>
              )}
            </div>
          )}

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
              disabled={loading || loadingUsuarios}
              className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinnerInline />
                  Asignando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Asignar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

