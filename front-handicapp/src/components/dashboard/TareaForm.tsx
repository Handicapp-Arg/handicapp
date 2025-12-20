'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService, CreateTareaData } from '@/lib/services/tareaService';
import { caballoService } from '@/lib/services/caballoService';
import { establecimientoService } from '@/lib/services/establecimientoService';
import { userService } from '@/lib/services/userService';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Modal } from '@/components/ui/modal';

interface TareaLocal {
  id: number;
  titulo: string;
  descripcion?: string;
  estado: string;
  prioridad?: string;
  fecha_vencimiento?: string;
  asignado_a_usuario_id?: number;
  caballo_id?: number;
  establecimiento_id?: number;
  tipo?: string;
  tiempo_estimado_minutos?: number;
  ubicacion?: string;
}

interface TareaFormProps {
  isOpen: boolean;
  onClose: () => void;
  tarea?: TareaLocal;
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
  const { user } = useAuthNew();
  const { canAssignTasks, getUserRole } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // El backend espera los estados en español directamente

  const [formData, setFormData] = useState<CreateTareaData>({
    titulo: '',
    descripcion: '',
    tipo: 'otro',
    prioridad: 'media',
    estado: 'pendiente',
    fecha_vencimiento: '',
    tiempo_estimado_minutos: 60,
    ubicacion: '',
    caballo_id: undefined,
    establecimiento_id: user?.establecimiento_id || undefined,
    asignado_a_usuario_id: undefined
  });

  // Estados para multi-select
  const [selectedCaballos, setSelectedCaballos] = useState<number[]>([]);
  const [selectedUsuarios, setSelectedUsuarios] = useState<number[]>([]);
  const [caballoSearch, setCaballoSearch] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [showCaballoDropdown, setShowCaballoDropdown] = useState(false);
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false);

  // Funciones de carga de datos
  const loadCaballos = useCallback(async () => {
    try {
      const response = await caballoService.getAll();
      const caballosArray = Array.isArray(response) 
        ? response 
        : ((response as { data?: { caballos?: unknown[] } })?.data?.caballos || (response as { data?: unknown[] })?.data || []);
      setCaballos(caballosArray as Caballo[]);
    } catch {
      setCaballos([]);
    }
  }, []);

  const loadEstablecimientos = useCallback(async () => {
    try {
      const response = await establecimientoService.getAll();
      const establecimientosArray = Array.isArray(response) 
        ? response 
        : ((response as { data?: { establecimientos?: unknown[] } })?.data?.establecimientos || (response as { data?: unknown[] })?.data || []);
      setEstablecimientos(establecimientosArray as Establecimiento[]);
    } catch {
      setEstablecimientos([]);
    }
  }, []);

  const loadUsuarios = useCallback(async () => {
    try {
      const filters: Record<string, number> = {};
      if (user?.rol?.clave === 'establecimiento' && user?.establecimiento_id) {
        filters.establecimiento_id = user.establecimiento_id;
      }
      
      const response = await userService.getAll(filters);
      const usuariosArray = Array.isArray(response) 
        ? response 
        : ((response as { data?: { users?: unknown[], usuarios?: unknown[] }, users?: unknown[] })?.data?.users 
          || (response as { data?: { users?: unknown[], usuarios?: unknown[] }, users?: unknown[] })?.data?.usuarios 
          || (response as { data?: { users?: unknown[], usuarios?: unknown[] }, users?: unknown[] })?.users 
          || (response as { data?: unknown[] })?.data 
          || []);
      setUsuarios(usuariosArray as Usuario[]);
    } catch {
      setUsuarios([]);
    }
  }, [user]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadCaballos();
      loadUsuarios();
      if (user?.rol?.clave === 'admin') {
        loadEstablecimientos();
      }
    }
  }, [isOpen, user, loadCaballos, loadUsuarios, loadEstablecimientos]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'otro',
        prioridad: 'media',
        estado: 'pendiente',
        fecha_vencimiento: '',
        tiempo_estimado_minutos: 60,
        ubicacion: '',
        caballo_id: undefined,
        establecimiento_id: user?.establecimiento_id || undefined,
        asignado_a_usuario_id: undefined
      });
      setSelectedCaballos([]);
      setSelectedUsuarios([]);
      setError(null);
    }
  }, [isOpen, user?.establecimiento_id]);

  // Poblar formulario si es edición
  useEffect(() => {
    if (tarea && isOpen) {
      const asignadoId = tarea.asignado_a_usuario_id;
      const tipo = (tarea.tipo as CreateTareaData['tipo']) || 'otro';
      const prioridad = (tarea.prioridad as CreateTareaData['prioridad']) || 'media';
      const estado = (tarea.estado as CreateTareaData['estado']) || 'pendiente';
      
      setFormData({
        titulo: tarea.titulo || '',
        descripcion: tarea.descripcion || '',
        tipo,
        prioridad,
        estado,
        fecha_vencimiento: tarea.fecha_vencimiento ? tarea.fecha_vencimiento.split('T')[0] : '',
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos || 60,
        ubicacion: tarea.ubicacion || '',
        caballo_id: tarea.caballo_id,
        establecimiento_id: tarea.establecimiento_id,
        asignado_a_usuario_id: asignadoId
      });
      // En modo edición, usar selección única
      setSelectedCaballos(tarea.caballo_id ? [tarea.caballo_id] : []);
      setSelectedUsuarios(asignadoId ? [asignadoId] : []);
    } else if (isOpen) {
      // Reset para nueva tarea
      setFormData({
        titulo: '',
        descripcion: '',
        tipo: 'otro',
        prioridad: 'media',
        estado: 'pendiente',
        fecha_vencimiento: '',
        tiempo_estimado_minutos: 60,
        ubicacion: '',
        caballo_id: undefined,
        establecimiento_id: user?.establecimiento_id || undefined,
        asignado_a_usuario_id: undefined
      });
      setSelectedCaballos([]);
      setSelectedUsuarios([]);
      setCaballoSearch('');
      setUsuarioSearch('');
      setShowCaballoDropdown(false);
      setShowUsuarioDropdown(false);
    }
  }, [tarea, isOpen, user]);

  // Cerrar dropdowns cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-caballos')) {
        setShowCaballoDropdown(false);
      }
      if (!target.closest('.dropdown-usuarios')) {
        setShowUsuarioDropdown(false);
      }
    };

    if (showCaballoDropdown || showUsuarioDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCaballoDropdown, showUsuarioDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar datos - solo incluir campos con valor
      const tareaData: Partial<CreateTareaData> = {
        titulo: formData.titulo,
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        estado: formData.estado || 'pendiente',
      };

      // En modo edición, siempre enviar descripcion (puede estar vacía)
      // En modo creación, solo si tiene contenido
      if (tarea) {
        tareaData.descripcion = formData.descripcion?.trim() || '';
      } else if (formData.descripcion && formData.descripcion.trim()) {
        tareaData.descripcion = formData.descripcion.trim();
      }

      // Agregar campos opcionales solo si tienen valor
      if (formData.fecha_vencimiento && formData.fecha_vencimiento.trim()) {
        tareaData.fecha_vencimiento = formData.fecha_vencimiento;
      }
      if (formData.tiempo_estimado_minutos) {
        tareaData.tiempo_estimado_minutos = parseInt(formData.tiempo_estimado_minutos.toString());
      }
      if (formData.ubicacion && formData.ubicacion.trim()) {
        tareaData.ubicacion = formData.ubicacion.trim();
      }
      if (formData.establecimiento_id) {
        tareaData.establecimiento_id = formData.establecimiento_id;
      }
      if (formData.caballo_id) {
        tareaData.caballo_id = formData.caballo_id;
      }
      if (formData.asignado_a_usuario_id) {
        tareaData.asignado_a_usuario_id = formData.asignado_a_usuario_id;
      }

      if (tarea) {
        // Modo edición: actualizar tarea existente
        const tareaId = typeof tarea.id === 'string' 
          ? parseInt((tarea.id as string).replace(/\D/g, '')) 
          : tarea.id;
        await tareaService.update(tareaId, tareaData);
      } else {
        // Modo creación: soportar multi-select
        const caballosParaTarea = selectedCaballos.length > 0 ? selectedCaballos : [null];
        const usuariosParaTarea = selectedUsuarios.length > 0 ? selectedUsuarios : [null];

        // Crear una tarea por cada combinación caballo-usuario
        const tareasACrear: CreateTareaData[] = [];
        for (const caballoId of caballosParaTarea) {
          for (const usuarioId of usuariosParaTarea) {
            const nuevaTarea: CreateTareaData = {
              titulo: tareaData.titulo!,
              tipo: tareaData.tipo!,
              prioridad: tareaData.prioridad!,
              estado: tareaData.estado,
              descripcion: tareaData.descripcion,
              fecha_vencimiento: tareaData.fecha_vencimiento,
              tiempo_estimado_minutos: tareaData.tiempo_estimado_minutos,
              ubicacion: tareaData.ubicacion,
              establecimiento_id: tareaData.establecimiento_id,
              caballo_id: caballoId || undefined,
              asignado_a_usuario_id: usuarioId || undefined
            };
            tareasACrear.push(nuevaTarea);
          }
        }

        // Crear todas las tareas
        await Promise.all(tareasACrear.map(t => tareaService.create(t)));
      }
      onSuccess();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMsg = err.response?.data?.message || err.message || 'Error al guardar la tarea';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | undefined = value;
    
    // Para campos de fecha, mantener el valor string vacío
    if (type === 'date') {
      processedValue = value; // Mantener '' para fechas vacías
    }
    // Convertir strings vacíos a undefined (excepto fecha)
    else if (value === '') {
      processedValue = undefined;
    } 
    // Convertir campos numéricos
    else if (type === 'number') {
      processedValue = value ? Number(value) : undefined;
    }
    // Para selects con "Sin asignar" o valores vacíos
    else if ((name === 'caballo_id' || name === 'asignado_a_usuario_id') && value === '') {
      processedValue = undefined;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Funciones para multi-select
  const toggleCaballo = (caballoId: number) => {
    setSelectedCaballos(prev =>
      prev.includes(caballoId)
        ? prev.filter(id => id !== caballoId)
        : [...prev, caballoId]
    );
  };

  const toggleUsuario = (usuarioId: number) => {
    setSelectedUsuarios(prev =>
      prev.includes(usuarioId)
        ? prev.filter(id => id !== usuarioId)
        : [...prev, usuarioId]
    );
  };

  const filteredCaballos = caballos.filter(c =>
    c.nombre.toLowerCase().includes(caballoSearch.toLowerCase())
  );

  const filteredUsuarios = usuarios.filter(u =>
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(usuarioSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tarea ? 'Editar tarea' : 'Crear tarea'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Notificación de permisos - Más compacta */}
          {!canAssignTasks() && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded-md text-sm">
              <strong>Rol {getUserRole()}:</strong> No puedes asignar tareas a otros usuarios.
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo || ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Tarea *
              </label>
              <select
                name="tipo"
                value={formData.tipo || 'otro'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <optgroup label="Tareas del Caballo">
                  <option value="alimentacion">Alimentación</option>
                  <option value="limpieza_box">Limpieza de Box</option>
                  <option value="aseo_caballo">Aseo del Caballo</option>
                  <option value="ejercicio">Ejercicio</option>
                  <option value="salud">Salud</option>
                  <option value="entrenamiento">Entrenamiento</option>
                </optgroup>
                <optgroup label="Tareas del Establecimiento">
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="reparacion">Reparación</option>
                  <option value="limpieza_general">Limpieza General</option>
                  <option value="compras">Compras</option>
                  <option value="otro">Otro</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              placeholder="Descripción detallada de la tarea"
            />
          </div>

          {/* Prioridad, Estado y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={formData.prioridad || 'media'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado || 'pendiente'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Tiempo Estimado y Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tiempo Estimado (minutos)
              </label>
              <input
                type="number"
                name="tiempo_estimado_minutos"
                value={formData.tiempo_estimado_minutos || 60}
                onChange={handleChange}
                min="5"
                max="1440"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="Ej: Box 12, Pista A"
              />
            </div>
          </div>

          {/* Asignar Usuarios y Caballos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Asignar a Usuarios
              </label>
              
              {!canAssignTasks() ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm">
                  No puedes asignar tareas
                </div>
              ) : tarea ? (
                // Modo edición: select simple
                <select
                  name="asignado_a_usuario_id"
                  value={formData.asignado_a_usuario_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">Sin asignar</option>
                  {usuarios
                    .filter(usuario => usuario.rol?.clave !== 'admin')
                    .map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido} ({usuario.rol?.nombre})
                      </option>
                    ))}
                </select>
              ) : (
                // Modo creación: dropdown expandible
                <div className="relative dropdown-usuarios">
                  <button
                    type="button"
                    onClick={() => setShowUsuarioDropdown(!showUsuarioDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                  <span className="text-sm">
                    {selectedUsuarios.length === 0 
                      ? 'Seleccionar usuarios...' 
                      : `${selectedUsuarios.length} usuario${selectedUsuarios.length > 1 ? 's' : ''} seleccionado${selectedUsuarios.length > 1 ? 's' : ''}`
                    }
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${showUsuarioDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                  
                  {showUsuarioDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Buscar usuarios..."
                          value={usuarioSearch}
                          onChange={(e) => setUsuarioSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsuarios.filter(u => u.rol?.clave !== 'admin').length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            No hay usuarios disponibles
                          </div>
                        ) : (
                          filteredUsuarios
                            .filter(usuario => usuario.rol?.clave !== 'admin')
                            .map(usuario => (
                              <label
                                key={usuario.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedUsuarios.includes(usuario.id)}
                                  onChange={() => toggleUsuario(usuario.id)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm flex-1">
                                  {usuario.nombre} {usuario.apellido}
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({usuario.rol?.nombre})
                                  </span>
                                </span>
                              </label>
                            ))
                        )}
                      </div>
                      
                      {selectedUsuarios.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                          Sin selección = tarea sin asignar
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Caballos
              </label>
              
              {tarea ? (
                // Modo edición: select simple
                <select
                  name="caballo_id"
                  value={formData.caballo_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">General (sin caballo)</option>
                  {caballos.map(caballo => (
                    <option key={caballo.id} value={caballo.id}>
                      {caballo.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                // Modo creación: dropdown expandible
                <div className="relative dropdown-caballos">
                  <button
                    type="button"
                    onClick={() => setShowCaballoDropdown(!showCaballoDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">
                      {selectedCaballos.length === 0 
                        ? 'Seleccionar caballos...' 
                        : `${selectedCaballos.length} caballo${selectedCaballos.length > 1 ? 's' : ''} seleccionado${selectedCaballos.length > 1 ? 's' : ''}`
                      }
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${showCaballoDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showCaballoDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Buscar caballos..."
                          value={caballoSearch}
                          onChange={(e) => setCaballoSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCaballos.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            {caballoSearch ? 'No se encontraron caballos' : 'No hay caballos'}
                          </div>
                        ) : (
                          filteredCaballos.map(caballo => (
                            <label
                              key={caballo.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCaballos.includes(caballo.id)}
                                onChange={() => toggleCaballo(caballo.id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <span className="text-sm flex-1">
                                {caballo.nombre}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                      
                      {selectedCaballos.length === 0 && (
                        <div className="px-2 py-1.5 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
                          Sin selección = tarea general
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Establecimiento (solo admin) */}
          {user?.rol?.clave === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Establecimiento
              </label>
              <select
                name="establecimiento_id"
                value={formData.establecimiento_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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

          {/* Resumen de creación masiva - Más compacto */}
          {!tarea && (selectedCaballos.length > 0 || selectedUsuarios.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-xs font-medium text-blue-900 mb-1.5">
                Resumen de creación:
              </p>
              <div className="text-xs text-blue-800 space-y-0.5">
                <div>Caballos: {selectedCaballos.length > 0 ? `${selectedCaballos.length} seleccionados` : 'Tarea general'}</div>
                <div>Usuarios: {selectedUsuarios.length > 0 ? `${selectedUsuarios.length} asignados` : 'Sin asignar'}</div>
                <div className="font-semibold pt-1.5 border-t border-blue-300 mt-1.5">
                  Se crearán {Math.max(1, selectedCaballos.length) * Math.max(1, selectedUsuarios.length)} tarea(s)
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {tarea ? 'Actualizar' : 'Crear'} {!tarea && (selectedCaballos.length > 1 || selectedUsuarios.length > 1) ? 'tareas' : 'tarea'}
            </button>
          </div>
        </form>
    </Modal>
  );
}