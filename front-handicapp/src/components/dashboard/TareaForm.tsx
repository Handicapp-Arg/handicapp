'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { tareaService, CreateTareaData } from '@/lib/services/tareaService';
import { caballoService } from '@/lib/services/caballoService';
import { establecimientoService } from '@/lib/services/establecimientoService';
import { userService } from '@/lib/services/userService';

interface TareaFormProps {
  isOpen: boolean;
  onClose: () => void;
  tarea?: any;
  onSuccess: () => void;
}

interface Caballo {
  id: number;
  nombre: string;
  establecimiento_id: number;
}

interface Establecimiento {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol?: {
    clave: string;
    nombre: string;
  };
}

export function TareaForm({ isOpen, onClose, tarea, onSuccess }: TareaFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const [formData, setFormData] = useState<CreateTareaData>({
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    prioridad: 'media',
    fecha_vencimiento: '',
    tiempo_estimado_minutos: 60,
    ubicacion: '',
    caballo_id: undefined,
    establecimiento_id: undefined,
    asignado_a_usuario_id: undefined
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCaballos();
      loadUsuarios();
      if (user?.rol?.clave === 'admin') {
        loadEstablecimientos();
      }
    }
  }, [isOpen, user]);

  // Poblar formulario si es edición
  useEffect(() => {
    if (tarea && isOpen) {
      setFormData({
        titulo: tarea.titulo || '',
        descripcion: tarea.descripcion || '',
        tipo: tarea.tipo || 'otro',
        prioridad: tarea.prioridad || 'media',
        fecha_vencimiento: tarea.fecha_vencimiento ? tarea.fecha_vencimiento.split('T')[0] : '',
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos || 60,
        ubicacion: tarea.ubicacion || '',
        caballo_id: tarea.caballo_id,
        establecimiento_id: tarea.establecimiento_id,
        asignado_a_usuario_id: tarea.asignado_a_usuario_id
      });
    } else if (isOpen) {
      // Reset para nueva tarea
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'otro',
        prioridad: 'media',
        fecha_vencimiento: '',
        tiempo_estimado_minutos: 60,
        ubicacion: '',
        caballo_id: undefined,
        establecimiento_id: user?.establecimiento_id || undefined,
        asignado_a_usuario_id: undefined
      });
    }
  }, [tarea, isOpen, user]);

  const loadCaballos = async () => {
    try {
      const response = await caballoService.getAll() as any;
      setCaballos(response.data || []);
    } catch (error) {
      console.error('Error cargando caballos:', error);
    }
  };

  const loadEstablecimientos = async () => {
    try {
      const response = await establecimientoService.getAll() as any;
      setEstablecimientos(response.data || []);
    } catch (error) {
      console.error('Error cargando establecimientos:', error);
    }
  };

  const loadUsuarios = async () => {
    try {
      const response = await userService.getAll() as any;
      setUsuarios(response.data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tarea) {
        await tareaService.update(tarea.id, formData);
      } else {
        await tareaService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {tarea ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tarea *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="alimentacion">🌾 Alimentación</option>
                <option value="limpieza">🧹 Limpieza</option>
                <option value="entrenamiento">🏋️ Entrenamiento</option>
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="veterinaria">🩺 Veterinaria</option>
                <option value="administrativa">📋 Administrativa</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada de la tarea"
            />
          </div>

          {/* Prioridad y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">🟢 Baja</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🟠 Alta</option>
                <option value="critica">🔴 Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo Estimado (minutos)
              </label>
              <input
                type="number"
                name="tiempo_estimado_minutos"
                value={formData.tiempo_estimado_minutos}
                onChange={handleChange}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Asignación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar a Usuario
              </label>
              <select
                name="asignado_a_usuario_id"
                value={formData.asignado_a_usuario_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin asignar</option>
                {usuarios
                  .filter(usuario => usuario.rol?.clave !== 'admin') // Filtrar admins
                  .map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} {usuario.apellido} ({usuario.rol?.nombre})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ubicación donde realizar la tarea"
              />
            </div>
          </div>

          {/* Caballo y Establecimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caballo
              </label>
              <select
                name="caballo_id"
                value={formData.caballo_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">General (sin caballo específico)</option>
                {caballos.map(caballo => (
                  <option key={caballo.id} value={caballo.id}>
                    {caballo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {user?.rol?.clave === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establecimiento
                </label>
                <select
                  name="establecimiento_id"
                  value={formData.establecimiento_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar establecimiento</option>
                  {establecimientos.map(establecimiento => (
                    <option key={establecimiento.id} value={establecimiento.id}>
                      {establecimiento.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : tarea ? 'Actualizar' : 'Crear'} Tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}