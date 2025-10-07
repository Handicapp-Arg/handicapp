'use client';

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { eventoService, EventoFormData } from '@/lib/services/eventoService';
import { caballoService } from '@/lib/services/caballoService';
import { establecimientoService } from '@/lib/services/establecimientoService';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface EventoFormProps {
  isOpen: boolean;
  onClose: () => void;
  evento?: any;
  onSuccess: () => void;
}

interface TipoEvento {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
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

export function EventoForm({ isOpen, onClose, evento, onSuccess }: EventoFormProps) {
  const { user } = useAuthNew();
  const { canCreateMedicalEvents, getUserRole } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);

  const [formData, setFormData] = useState<EventoFormData>({
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    tipo_evento_id: 0,
    caballo_id: undefined,
    establecimiento_id: undefined,
    ubicacion: '',
    observaciones: '',
    estado: 'programado',
    prioridad: 'media',
    es_publico: false,
    requiere_validacion: false
  });

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadTiposEvento();
      loadCaballos();
      if (user?.rol?.clave === 'admin') {
        loadEstablecimientos();
      }
    }
  }, [isOpen, user]);

  // Poblar formulario si es edición
  useEffect(() => {
    if (evento && isOpen) {
      setFormData({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        fecha_evento: evento.fecha_evento ? evento.fecha_evento.split('T')[0] : '',
        hora_inicio: evento.hora_inicio || '',
        hora_fin: evento.hora_fin || '',
        tipo_evento_id: evento.tipo_evento_id || 0,
        caballo_id: evento.caballo_id,
        establecimiento_id: evento.establecimiento_id,
        ubicacion: evento.ubicacion || '',
        observaciones: evento.observaciones || '',
        estado: evento.estado || 'programado',
        prioridad: evento.prioridad || 'media',
        es_publico: evento.es_publico || false,
        requiere_validacion: evento.requiere_validacion || false
      });
    } else if (isOpen) {
      // Reset para nuevo evento
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_evento: '',
        hora_inicio: '',
        hora_fin: '',
        tipo_evento_id: 0,
        caballo_id: undefined,
        establecimiento_id: user?.establecimiento_id || undefined,
        ubicacion: '',
        observaciones: '',
        estado: 'programado',
        prioridad: 'media',
        es_publico: false,
        requiere_validacion: false
      });
    }
  }, [evento, isOpen, user]);

  const loadTiposEvento = async () => {
    try {
      // Los tipos de evento ya están seeded en el backend
      const allTipos: TipoEvento[] = [
        { id: 1, nombre: 'Vacunación', categoria: 'salud', descripcion: 'Administración de vacunas' },
        { id: 2, nombre: 'Desparasitación', categoria: 'salud', descripcion: 'Tratamiento antiparasitario' },
        { id: 3, nombre: 'Revisión Veterinaria', categoria: 'salud', descripcion: 'Examen médico general' },
        { id: 4, nombre: 'Entrenamiento', categoria: 'deporte', descripcion: 'Sesión de entrenamiento' },
        { id: 5, nombre: 'Competencia', categoria: 'deporte', descripcion: 'Evento competitivo' },
        { id: 6, nombre: 'Traslado', categoria: 'logistica', descripcion: 'Transporte del caballo' },
        { id: 7, nombre: 'Alimentación Especial', categoria: 'nutricion', descripcion: 'Dieta específica' },
        { id: 8, nombre: 'Herrado', categoria: 'mantenimiento', descripcion: 'Cambio de herraduras' }
      ];
      
      // Filtrar tipos según permisos:
      // - Veterinario: puede crear todos los tipos
      // - Otros roles: no pueden crear eventos de salud
      const filteredTipos = canCreateMedicalEvents() 
        ? allTipos 
        : allTipos.filter(tipo => tipo.categoria !== 'salud');
        
      setTiposEvento(filteredTipos);
    } catch (error) {
      console.error('Error cargando tipos de evento:', error);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir EventoFormData a CreateEventoData para el backend
      const createData: any = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fecha_evento: formData.fecha_evento,
        tipo_evento_id: formData.tipo_evento_id,
        caballo_id: formData.caballo_id,
        establecimiento_id: formData.establecimiento_id,
        ubicacion: formData.ubicacion,
        observaciones: formData.observaciones,
        prioridad: formData.prioridad,
        costo: formData.costo
      };

      if (evento) {
        await eventoService.update(evento.id, createData);
      } else {
        await eventoService.create(createData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al guardar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: EventoFormData) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value === '' ? undefined : value
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={evento ? 'Editar evento' : 'Crear evento'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Notificación de permisos */}
          {!canCreateMedicalEvents() && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <span>ℹ️</span>
                <span>
                  <strong>Rol {getUserRole()}:</strong> Los eventos médicos (vacunación, revisiones veterinarias, etc.) 
                  solo pueden ser creados por veterinarios.
                </span>
              </div>
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
                placeholder="Título del evento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento *
              </label>
              <select
                name="tipo_evento_id"
                value={formData.tipo_evento_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar tipo</option>
                {tiposEvento.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre} ({tipo.categoria})
                  </option>
                ))}
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
              placeholder="Descripción del evento"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha_evento"
                value={formData.fecha_evento}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Inicio
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Fin
              </label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <option value="">Seleccionar caballo</option>
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

          {/* Estado y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="programado">Programado</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
                <option value="reprogramado">Reprogramado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
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
                placeholder="Ubicación del evento"
              />
            </div>
          </div>

          {/* Opciones */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="es_publico"
                checked={formData.es_publico}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Evento público
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requiere_validacion"
                checked={formData.requiere_validacion}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Requiere validación veterinaria
              </label>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observaciones adicionales"
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={loading} disabled={loading}>
              {evento ? 'Actualizar' : 'Crear'} evento
            </Button>
          </div>
        </form>
    </Modal>
  );
}