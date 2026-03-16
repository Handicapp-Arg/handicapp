'use client';

import { useState, useEffect } from 'react';
import { propietarioService, type Propietario } from '@/lib/services/ownerService';
import { toast } from 'react-hot-toast';
import { UserIcon, CalendarIcon, XMarkIcon, PencilIcon, ClockIcon, ChartPieIcon } from '@heroicons/react/24/outline';

interface PropietariosListProps {
  caballoId: number;
  readOnly?: boolean;
}

export default function PropietariosList({ caballoId, readOnly = false }: PropietariosListProps) {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [showHistorial, setShowHistorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    porcentaje_tenencia: number;
    fecha_inicio: string;
  }>({
    porcentaje_tenencia: 100,
    fecha_inicio: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadPropietarios();
  }, [caballoId, showHistorial]);

  const loadPropietarios = async () => {
    try {
      setLoading(true);
      const data = showHistorial
        ? await propietarioService.getHistorial(caballoId)
        : await propietarioService.getPropietarios(caballoId);
      setPropietarios(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar propietarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prop: Propietario) => {
    setEditingId(prop.propietario_usuario_id);
    setEditForm({
      porcentaje_tenencia: prop.porcentaje_tenencia || 100,
      fecha_inicio: prop.fecha_inicio?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
  };

  const handleSaveEdit = async (propietarioId: number) => {
    try {
      await propietarioService.updatePropietario(caballoId, propietarioId, {
        porcentaje_tenencia: editForm.porcentaje_tenencia,
        fecha_inicio: editForm.fecha_inicio,
      });
      toast.success('Propietario actualizado exitosamente');
      setEditingId(null);
      loadPropietarios();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar propietario');
    }
  };

  const handleRemove = async (propietarioId: number) => {
    if (!confirm('¿Está seguro de finalizar esta propiedad?')) return;

    try {
      await propietarioService.removePropietario(caballoId, propietarioId);
      toast.success('Propiedad finalizada exitosamente');
      loadPropietarios();
    } catch (error: any) {
      toast.error(error.message || 'Error al finalizar propiedad');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 mx-auto relative">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-gray-800 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 font-medium">Cargando propietarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con toggle historial */}
      <div className="bg-white rounded-md border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-md">
              <UserIcon className="w-6 h-6 text-gray-700" />
            </div>
            {showHistorial ? 'Historial de Propietarios' : 'Propietarios Actuales'}
            {readOnly && (
              <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                Solo lectura
              </span>
            )}
          </h3>
          {!readOnly && (
            <button
              onClick={() => setShowHistorial(!showHistorial)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
            >
              <ClockIcon className="h-4 w-4" />
              {showHistorial ? 'Ver Actuales' : 'Ver Historial'}
            </button>
          )}
        </div>
      </div>

      {/* Lista de propietarios */}
      {propietarios.length === 0 ? (
        <div className="bg-white rounded-md border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <UserIcon className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sin propietarios</h3>
            <p className="text-gray-600">
              {showHistorial
                ? 'No hay historial de propietarios para este caballo'
                : 'No hay propietarios actuales registrados'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {propietarios.map((prop) => (
            <div
              key={prop.id}
              className={`bg-white rounded-md p-6 border ${
                prop.actual
                  ? 'border-emerald-200 ring-2 ring-emerald-100'
                  : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Información del propietario */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                        <UserIcon className="h-7 w-7 text-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900">
                        {prop.propietario?.nombre} {prop.propietario?.apellido}
                      </h4>
                      <p className="text-sm text-gray-600">{prop.propietario?.email}</p>
                    </div>
                    {prop.actual && (
                      <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-md ring-2 ring-emerald-200">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                        Actual
                      </span>
                    )}
                  </div>

                  {/* Detalles editables */}
                  {editingId === prop.propietario_usuario_id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Porcentaje de Tenencia
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editForm.porcentaje_tenencia}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                porcentaje_tenencia: Number(e.target.value),
                              })
                            }
                            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                          />
                          <ChartPieIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Inicio
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={editForm.fecha_inicio}
                            onChange={(e) =>
                              setEditForm({ ...editForm, fecha_inicio: e.target.value })
                            }
                            className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(prop.propietario_usuario_id)}
                          className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-700-xl text-sm font-medium"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <ChartPieIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Tenencia:</span>
                        <span>{prop.porcentaje_tenencia || 0}%</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Inicio:</span>
                        <span>{formatDate(prop.fecha_inicio)}</span>
                      </div>
                      {prop.fecha_fin && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">Fin:</span>
                          <span>{formatDate(prop.fecha_fin)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Acciones - Solo para propietarios actuales */}
                {prop.actual && !readOnly && editingId !== prop.propietario_usuario_id && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(prop)}
                      className="p-2.5 text-gray-900 hover:bg-gray-900/10 rounded-md"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemove(prop.propietario_usuario_id)}
                      className="p-2.5 text-red-600 hover:bg-red-50 rounded-md"
                      title="Finalizar propiedad"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
