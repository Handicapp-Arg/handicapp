'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Calendar,
  Pill,
  FileText,
  Clock
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { eventoService } from '@/lib/services/eventoService';
import { caballoService } from '@/lib/services/caballoService';
import { toast } from 'react-hot-toast';

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
}

export default function CrearTratamientoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [caballos, setCaballos] = useState<any[]>([]);
  const [tipoTratamientoId, setTipoTratamientoId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    caballo_id: '',
    titulo: '',
    descripcion: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    medicamentos: '',
    dosis: '',
    frecuencia: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarCaballos();
    cargarTipoTratamiento();
  }, []);

  const cargarTipoTratamiento = async () => {
    try {
      const tipos = await eventoService.getTipos();
      const tipo = tipos.find(t => t.clave === 'tratamiento_medico');
      if (tipo) setTipoTratamientoId(tipo.id);
    } catch { /* continúa sin tipo, el submit lo validará */ }
  };

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

    if (!tipoTratamientoId) {
      toast.error('Error: no se pudo cargar el tipo de tratamiento. Recargá la página.');
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        caballo_id: parseInt(formData.caballo_id),
        tipo_evento_id: tipoTratamientoId,
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        fecha_evento: formData.fecha_inicio,
        prioridad: 'media' as const,
        ubicacion: '',
        observaciones: formData.observaciones || undefined,
      };

      await eventoService.create(dataToSend);
      toast.success('✅ Tratamiento creado exitosamente');
      router.push('/veterinario/tratamientos');
    } catch (error) {
      toast.error('Error al crear el tratamiento');
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
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Tratamiento</h1>
            <p className="text-sm text-gray-600">Registra un nuevo tratamiento médico</p>
          </div>
        </div>

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
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader variant="inline" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Tratamiento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </SimpleRoleGuard>
  );
}
