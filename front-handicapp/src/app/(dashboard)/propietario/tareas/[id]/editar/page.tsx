'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  Clock,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  ListTodo
} from 'lucide-react';
import { tareaService, Tarea } from '@/lib/services/tareaService';
import { caballoService } from '@/lib/services/caballoService';
import { userService, User as UserType } from '@/lib/services/userService';
import { toast } from 'react-hot-toast';
import TableSkeleton from '@/components/skeletons/TableSkeleton';

export default function EditarTareaPage() {
  const router = useRouter();
  const params = useParams();
  const tareaId = params?.id ? parseInt(params.id as string) : null;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [caballos, setCaballos] = useState<Array<{ id: number; nombre: string }>>([]);
  const [usuarios, setUsuarios] = useState<UserType[]>([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'alimentacion' as any,
    prioridad: 'media' as any,
    fecha_vencimiento: '',
    tiempo_estimado_minutos: undefined as number | undefined,
    ubicacion: '',
    caballo_id: undefined as number | undefined,
    asignado_a_usuario_id: undefined as number | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tareaId) {
      cargarDatos();
    }
  }, [tareaId]);

  const cargarDatos = async () => {
    if (!tareaId) return;

    try {
      setLoadingData(true);
      const [tareaResp, caballosResp, usuariosResp] = await Promise.all([
        tareaService.getById(tareaId),
        caballoService.getAll(),
        userService.getAll()
      ]);

      setTarea(tareaResp);
      setCaballos(Array.isArray(caballosResp) ? caballosResp : []);
      setUsuarios(usuariosResp?.data || []);

      // Cargar datos en el formulario
      setFormData({
        titulo: tareaResp.titulo,
        descripcion: tareaResp.descripcion || '',
        tipo: tareaResp.tipo,
        prioridad: tareaResp.prioridad,
        fecha_vencimiento: tareaResp.fecha_vencimiento ? tareaResp.fecha_vencimiento.substring(0, 16) : '',
        tiempo_estimado_minutos: tareaResp.tiempo_estimado_minutos,
        ubicacion: tareaResp.ubicacion || '',
        caballo_id: tareaResp.caballo_id,
        asignado_a_usuario_id: tareaResp.asignado_a_usuario_id,
      });
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar la tarea');
      router.push('/propietario/caballos');
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length < 3) {
      newErrors.titulo = 'El título debe tener al menos 3 caracteres';
    }

    if (formData.tiempo_estimado_minutos && formData.tiempo_estimado_minutos < 1) {
      newErrors.tiempo_estimado_minutos = 'El tiempo debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tareaId) return;

    if (!validate()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    try {
      setLoading(true);
      await tareaService.update(tareaId, formData);
      toast.success('✅ Tarea actualizada exitosamente');
      router.push('/propietario/caballos');
    } catch (error: any) {
      console.error('Error al actualizar tarea:', error);
      toast.error(error.message || 'Error al actualizar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (confirm('¿Descartar los cambios?')) {
      router.push('/propietario/caballos');
    }
  };

  if (loadingData) {
    return <TableSkeleton rows={6} columns={3} />;
  }

  if (!tarea) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Tarea no encontrada</p>
          <Link
            href="/propietario/caballos"
            className="text-brand-gold hover:text-brand-gold/80"
          >
            Volver a Mis Caballos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            href="/propietario/caballos"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListTodo className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Tarea</h1>
              <p className="text-gray-600 text-sm">{tarea.titulo}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-gold" />
            Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Alimentación matutina"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold resize-none"
                placeholder="Describe los detalles de la tarea..."
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="alimentacion">Alimentación</option>
                <option value="limpieza">Limpieza</option>
                <option value="entrenamiento">Entrenamiento</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="veterinaria">Veterinaria</option>
                <option value="administrativa">Administrativa</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha de Vencimiento
              </label>
              <input
                type="datetime-local"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              />
            </div>

            {/* Tiempo estimado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo Estimado (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.tiempo_estimado_minutos || ''}
                onChange={(e) => setFormData({ ...formData, tiempo_estimado_minutos: e.target.value ? parseInt(e.target.value) : undefined })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold ${
                  errors.tiempo_estimado_minutos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="60"
              />
              {errors.tiempo_estimado_minutos && (
                <p className="mt-1 text-sm text-red-600">{errors.tiempo_estimado_minutos}</p>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
                placeholder="Ej: Establo 3"
              />
            </div>

            {/* Caballo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Caballo (opcional)
              </label>
              <select
                value={formData.caballo_id || ''}
                onChange={(e) => setFormData({ ...formData, caballo_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="">Sin caballo asignado</option>
                {caballos.map((caballo) => (
                  <option key={caballo.id} value={caballo.id}>
                    {caballo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Usuario asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Asignar a Usuario (opcional)
              </label>
              <select
                value={formData.asignado_a_usuario_id || ''}
                onChange={(e) => setFormData({ ...formData, asignado_a_usuario_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold"
              >
                <option value="">Sin asignar</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido} - {usuario.rol?.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
