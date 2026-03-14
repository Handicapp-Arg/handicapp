'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2,
  Calendar, 
  Pill, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Activity
} from 'lucide-react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { tratamientoService, Tratamiento } from '@/lib/services/tratamientoService';
import { toast } from 'react-hot-toast';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

export default function DetalleTratamientoPage() {
  const router = useRouter();
  const params = useParams();
  const tratamientoId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tratamiento, setTratamiento] = useState<Tratamiento | null>(null);

  useEffect(() => {
    cargarTratamiento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tratamientoId]);

  const cargarTratamiento = async () => {
    try {
      setLoading(true);
      const data = await tratamientoService.getTratamiento(tratamientoId);
      setTratamiento(data);
    } catch (error) {
      console.error('Error cargando tratamiento:', error);
      toast.error('Error al cargar el tratamiento');
      router.push('/veterinario/tratamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletar = async () => {
    if (!confirm('¿Marcar este tratamiento como completado?')) return;
    
    try {
      setActionLoading(true);
      await tratamientoService.completarTratamiento(tratamientoId);
      toast.success('Tratamiento completado exitosamente');
      cargarTratamiento();
    } catch (error) {
      console.error('Error al completar tratamiento:', error);
      toast.error('Error al completar el tratamiento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspender = async () => {
    const motivo = prompt('Motivo de suspensión:');
    if (!motivo) return;
    
    try {
      setActionLoading(true);
      await tratamientoService.suspenderTratamiento(tratamientoId, motivo);
      toast.success('Tratamiento suspendido');
      cargarTratamiento();
    } catch (error) {
      console.error('Error al suspender tratamiento:', error);
      toast.error('Error al suspender el tratamiento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!confirm('¿Estás seguro de eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setActionLoading(true);
      await tratamientoService.eliminarTratamiento(tratamientoId);
      toast.success('Tratamiento eliminado exitosamente');
      router.push('/veterinario/tratamientos');
    } catch (error) {
      console.error('Error al eliminar tratamiento:', error);
      toast.error('Error al eliminar el tratamiento');
      setActionLoading(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!tratamiento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tratamiento no encontrado</h3>
          <p className="text-gray-600 mb-6">El tratamiento que buscas no existe o fue eliminado</p>
          <Link
            href="/veterinario/tratamientos"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a tratamientos
          </Link>
        </div>
      </div>
    );
  }

  const getEstadoBadge = () => {
    switch (tratamiento.estado) {
      case 'activo':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
            <Activity className="w-4 h-4" />
            Activo
          </span>
        );
      case 'completado':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completado
          </span>
        );
      case 'suspendido':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">
            <AlertTriangle className="w-4 h-4" />
            Suspendido
          </span>
        );
      default:
        return null;
    }
  };

  const diasTranscurridos = Math.floor(
    (new Date().getTime() - new Date(tratamiento.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24)
  );

  const progreso = tratamiento.duracion_dias 
    ? Math.min(100, (diasTranscurridos / tratamiento.duracion_dias) * 100)
    : 0;

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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/veterinario/tratamientos"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {tratamiento.titulo}
                </h1>
                <p className="text-white/90 text-sm">
                  Tratamiento médico - ID #{tratamiento.id}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href={`/veterinario/tratamientos/${tratamiento.id}/editar`}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-5 h-5 text-white" />
              </Link>
              <button
                onClick={handleEliminar}
                disabled={actionLoading}
                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Estado y Acciones */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            {getEstadoBadge()}
            
            {tratamiento.estado === 'activo' && (
              <div className="flex gap-2">
                <button
                  onClick={handleCompletar}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completar
                </button>
                <button
                  onClick={handleSuspender}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Suspender
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información del Paciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Paciente
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
              🐎
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {tratamiento.caballo?.nombre || `Caballo #${tratamiento.caballo_id}`}
              </h3>
              {tratamiento.caballo?.raza && (
                <p className="text-sm text-gray-600">
                  Raza: {tratamiento.caballo.raza}
                </p>
              )}
              <Link
                href={`/veterinario/caballos/${tratamiento.caballo_id}`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Ver ficha completa →
              </Link>
            </div>
          </div>
        </div>

        {/* Descripción del Tratamiento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Descripción del Tratamiento
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {tratamiento.descripcion}
          </p>
        </div>

        {/* Medicación y Dosificación */}
        {(tratamiento.medicamentos || tratamiento.dosis || tratamiento.frecuencia) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-purple-600" />
              Medicación y Dosificación
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tratamiento.medicamentos && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Medicamentos</p>
                  <p className="text-gray-900">{tratamiento.medicamentos}</p>
                </div>
              )}
              {tratamiento.dosis && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Dosis</p>
                  <p className="text-gray-900">{tratamiento.dosis}</p>
                </div>
              )}
              {tratamiento.frecuencia && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Frecuencia</p>
                  <p className="text-gray-900">{tratamiento.frecuencia}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cronología y Progreso */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Cronología
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Fecha de Inicio</p>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(tratamiento.fecha_inicio).toLocaleDateString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              {tratamiento.fecha_fin && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Fecha de Fin</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(tratamiento.fecha_fin).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              
              {tratamiento.duracion_dias && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Duración</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {tratamiento.duracion_dias} días
                  </p>
                </div>
              )}
            </div>

            {/* Barra de Progreso */}
            {tratamiento.duracion_dias && tratamiento.estado === 'activo' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">
                    Progreso del Tratamiento
                  </p>
                  <p className="text-sm font-medium text-purple-600">
                    {diasTranscurridos} / {tratamiento.duracion_dias} días
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {Math.round(progreso)}% completado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Observaciones */}
        {tratamiento.observaciones && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Observaciones Adicionales
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {tratamiento.observaciones}
            </p>
          </div>
        )}

        {/* Información del Registro */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Creado</p>
              <p className="font-medium text-gray-900">
                {new Date(tratamiento.fecha_inicio).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Veterinario</p>
              <p className="font-medium text-gray-900">
                ID #{tratamiento.veterinario_id}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Estado</p>
              <p className="font-medium text-gray-900 capitalize">
                {tratamiento.estado}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Tipo</p>
              <p className="font-medium text-gray-900">
                {tratamiento.tipo === 'tratamiento_medico' ? 'Tratamiento Médico' : tratamiento.tipo}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
