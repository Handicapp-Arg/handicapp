'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Calendar,
  Pill,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { eventoService } from '@/lib/services/eventoService';
import { caballoService } from '@/lib/services/caballoService';
import { toast } from 'react-hot-toast';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { Loader } from '@/components/ui/loader';

interface FormData {
  caballo_id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  medicamentos: string;
  dosis: string;
  frecuencia: string;
  observaciones: string;
  estado: 'activo' | 'completado' | 'cancelado';
}

export default function EditarTratamientoPage() {
  const router = useRouter();
  const params = useParams();
  const tratamientoId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [caballos, setCaballos] = useState<any[]>([]);
  const [tipoTratamientoId, setTipoTratamientoId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    caballo_id: '',
    titulo: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    medicamentos: '',
    dosis: '',
    frecuencia: '',
    observaciones: '',
    estado: 'activo',
  });

  useEffect(() => {
    cargarDatos();
  }, [tratamientoId]);

  const cargarDatos = async () => {
    try {
      setLoadingData(true);
      const [tratamientoResp, caballosResp, tiposResp] = await Promise.all([
        eventoService.getById(parseInt(tratamientoId)),
        caballoService.getAll({ limit: 100 }),
        eventoService.getTipos()
      ]);

      const tipoTratamiento = tiposResp.find(t => t.clave === 'tratamiento_medico');
      if (tipoTratamiento) setTipoTratamientoId(tipoTratamiento.id);

      const tratamiento = tratamientoResp as any;
      
      setFormData({
        caballo_id: tratamiento.caballo_id?.toString() || '',
        titulo: tratamiento.titulo || '',
        descripcion: tratamiento.descripcion || '',
        fecha_inicio: tratamiento.fecha_evento ? new Date(tratamiento.fecha_evento).toISOString().split('T')[0] : '',
        fecha_fin: tratamiento.fecha_fin ? new Date(tratamiento.fecha_fin).toISOString().split('T')[0] : '',
        medicamentos: tratamiento.metadata?.medicamentos || '',
        dosis: tratamiento.metadata?.dosis || '',
        frecuencia: tratamiento.metadata?.frecuencia || '',
        observaciones: tratamiento.observaciones || '',
        estado: tratamiento.estado || 'activo',
      });

      setCaballos((caballosResp as any)?.data?.caballos || []);
    } catch (error) {
      toast.error('Error al cargar el tratamiento');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.caballo_id || !formData.titulo) {
      toast.error('Por favor completa los campos requeridos');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        caballo_id: parseInt(formData.caballo_id),
        tipo_evento_id: tipoTratamientoId ?? undefined,
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        fecha_evento: formData.fecha_inicio,
        prioridad: 'media' as const,
        ubicacion: '',
        observaciones: formData.observaciones || undefined,
      };

      await eventoService.update(parseInt(tratamientoId), dataToSend);
      toast.success('✅ Tratamiento actualizado exitosamente');
      router.push('/veterinario/tratamientos');
    } catch (error) {
      toast.error('Error al actualizar el tratamiento');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: 'activo' | 'completado' | 'cancelado') => {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) return;

    try {
      setLoading(true);
      await eventoService.update(parseInt(tratamientoId), { 
        estado: nuevoEstado
      });
      setFormData({ ...formData, estado: nuevoEstado });
      toast.success(`Estado cambiado a ${nuevoEstado}`);
    } catch (error) {
      toast.error('Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <ProfileSkeleton />;
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Tratamiento</h1>
              <p className="text-sm text-gray-600">Modifica los detalles del tratamiento médico</p>
            </div>
          </div>

          {/* Estado Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
              formData.estado === 'activo' ? 'bg-blue-100 text-blue-700' :
              formData.estado === 'completado' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {formData.estado === 'activo' ? '🔵 Activo' :
               formData.estado === 'completado' ? '✅ Completado' :
               '❌ Cancelado'}
            </span>
          </div>
        </div>

        {/* Acciones rápidas de estado */}
        {formData.estado !== 'completado' && formData.estado !== 'cancelado' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Cambiar Estado</h3>
                <div className="flex gap-2">
                  {formData.estado === 'activo' && (
                    <>
                      <button
                        onClick={() => cambiarEstado('completado')}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        ✅ Marcar como Completado
                      </button>
                      <button
                        onClick={() => cambiarEstado('cancelado')}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        ❌ Cancelar Tratamiento
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Información del Tratamiento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Caballo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente (Caballo) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.caballo_id}
                  onChange={(e) => setFormData({ ...formData, caballo_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona un caballo</option>
                  {caballos.map((caballo) => (
                    <option key={caballo.id} value={caballo.id}>
                      {caballo.nombre} {caballo.raza && `(${caballo.raza})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Tratamiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Tratamiento antibiótico por infección"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Describe el diagnóstico y plan de tratamiento"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha de Finalización
                </label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                  min={formData.fecha_inicio}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Medicamentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  Medicamentos
                </label>
                <input
                  type="text"
                  value={formData.medicamentos}
                  onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
                  placeholder="Ej: Penicilina"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Dosis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosis
                </label>
                <input
                  type="text"
                  value={formData.dosis}
                  onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                  placeholder="Ej: 10ml"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Frecuencia */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Frecuencia
                </label>
                <input
                  type="text"
                  value={formData.frecuencia}
                  onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value })}
                  placeholder="Ej: Cada 12 horas"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Adicionales
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Notas adicionales sobre el tratamiento"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || formData.estado === 'completado' || formData.estado === 'cancelado'}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader variant="inline" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleRoleGuard>
  );
}
