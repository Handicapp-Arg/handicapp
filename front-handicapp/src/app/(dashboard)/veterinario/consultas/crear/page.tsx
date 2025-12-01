'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Stethoscope,
  FileText
} from 'lucide-react';
import { LoadingSpinnerInline } from '@/components/ui/loading-spinner';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { eventoService } from '@/lib/services/eventoService';
import { caballoService } from '@/lib/services/caballoService';
import { toast } from 'react-hot-toast';

interface FormData {
  caballo_id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  hora: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  motivo: string;
  observaciones: string;
}

export default function CrearConsultaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [caballos, setCaballos] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    caballo_id: '',
    titulo: '',
    descripcion: '',
    fecha_evento: new Date().toISOString().split('T')[0],
    hora: '09:00',
    prioridad: 'media',
    motivo: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarCaballos();
  }, []);

  const cargarCaballos = async () => {
    try {
      const data = await caballoService.getAll({ limit: 100 });
      setCaballos((data as any)?.data?.caballos || []);
    } catch (error) {
      toast.error('Error al cargar los caballos');
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
        tipo_evento_id: 2, // ID para consultas médicas
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        fecha_evento: `${formData.fecha_evento}T${formData.hora}:00`,
        prioridad: formData.prioridad,
        ubicacion: 'Consultorio Veterinario',
        observaciones: formData.observaciones || undefined,
      };

      await eventoService.create(dataToSend);
      toast.success('✅ Consulta agendada exitosamente');
      router.push('/veterinario/consultas');
    } catch (error) {
      toast.error('Error al agendar la consulta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nueva Consulta</h1>
            <p className="text-sm text-gray-600">Agenda una consulta veterinaria</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Información de la Consulta
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
                  Motivo de la Consulta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Revisión general, Cojera, Control post-operatorio"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción Detallada
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  placeholder="Describe los síntomas o razón de la consulta"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  disabled={loading}
                />
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fecha_evento}
                  onChange={(e) => setFormData({ ...formData, fecha_evento: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
              </div>

              {/* Prioridad */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.prioridad}
                  onChange={(e) => setFormData({ ...formData, prioridad: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                >
                  <option value="baja">Baja - Revisión de rutina</option>
                  <option value="media">Media - Consulta regular</option>
                  <option value="alta">Alta - Requiere atención pronta</option>
                  <option value="critica">Crítica - Urgente</option>
                </select>
              </div>

              {/* Observaciones */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Previas
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={2}
                  placeholder="Notas adicionales o antecedentes relevantes"
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
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoadingSpinnerInline />
                  Agendando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Agendar Consulta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleRoleGuard>
  );
}
