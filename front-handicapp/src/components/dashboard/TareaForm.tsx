'use client';

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService, CreateTareaData } from '@/lib/services/tareaService';
import { caballoService } from '@/lib/services/caballoService';
import { establecimientoService } from '@/lib/services/establecimientoService';
import { userService } from '@/lib/services/userService';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

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
  const { user } = useAuthNew();
  const { canAssignTasks, getUserRole } = usePermissions();
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
        estado: tarea.estado || 'pendiente',
        fecha_vencimiento: tarea.fecha_vencimiento ? tarea.fecha_vencimiento.split('T')[0] : '',
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos || 60,
        ubicacion: tarea.ubicacion || '',
        caballo_id: tarea.caballo_id,
        establecimiento_id: tarea.establecimiento_id,
        asignado_a_usuario_id: tarea.asignado_a_usuario_id
      });
      // En modo edición, usar selección única
      setSelectedCaballos(tarea.caballo_id ? [tarea.caballo_id] : []);
      setSelectedUsuarios(tarea.asignado_a_usuario_id ? [tarea.asignado_a_usuario_id] : []);
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

  const loadCaballos = async () => {
    try {
      const response = await caballoService.getAll() as any;
      // Manejar estructura de respuesta anidada
      const caballosArray = Array.isArray(response) 
        ? response 
        : response?.data?.caballos || response?.data || [];
      setCaballos(caballosArray);
    } catch (error) {
      setCaballos([]);
    }
  };

  const loadEstablecimientos = async () => {
    try {
      const response = await establecimientoService.getAll() as any;
      // Manejar estructura de respuesta anidada
      const establecimientosArray = Array.isArray(response) 
        ? response 
        : response?.data?.establecimientos || response?.data || [];
      setEstablecimientos(establecimientosArray);
    } catch (error) {
      setEstablecimientos([]);
    }
  };

  const loadUsuarios = async () => {
    try {
      // Si es establecimiento, filtrar solo usuarios de ese establecimiento
      const filters: any = {};
      if (user?.rol?.clave === 'establecimiento' && user?.establecimiento_id) {
        filters.establecimiento_id = user.establecimiento_id;
      }
      
      const response = await userService.getAll(filters) as any;
      // Manejar estructura de respuesta anidada
      const usuariosArray = Array.isArray(response) 
        ? response 
        : response?.data?.users || response?.data?.usuarios || response?.users || response?.data || [];
      
      console.log('Usuarios cargados:', usuariosArray);
      setUsuarios(usuariosArray);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      setUsuarios([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (tarea) {
        // Modo edición: actualizar tarea existente
        await tareaService.update(tarea.id, formData);
      } else {
        // Modo creación: soportar multi-select
        const caballosParaTarea = selectedCaballos.length > 0 ? selectedCaballos : [undefined];
        const usuariosParaTarea = selectedUsuarios.length > 0 ? selectedUsuarios : [undefined];

        // Limpiar formData: convertir strings vacíos en undefined
        const cleanedFormData = {
          ...formData,
          fecha_vencimiento: formData.fecha_vencimiento || undefined,
          ubicacion: formData.ubicacion || undefined,
          descripcion: formData.descripcion || undefined,
          tiempo_estimado_minutos: formData.tiempo_estimado_minutos || 60
        };

        // Crear una tarea por cada combinación caballo-usuario
        const tareasACrear = [];
        for (const caballoId of caballosParaTarea) {
          for (const usuarioId of usuariosParaTarea) {
            tareasACrear.push({
              ...cleanedFormData,
              caballo_id: caballoId,
              asignado_a_usuario_id: usuarioId
            });
          }
        }

        // Crear todas las tareas
        await Promise.all(tareasACrear.map(tarea => tareaService.create(tarea)));
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Notificación de permisos */}
          {!canAssignTasks() && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  <strong>Rol {getUserRole()}:</strong> No puedes asignar tareas a otros usuarios.
                  Las tareas serán creadas sin asignar.
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
                value={formData.titulo || ''}
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
                value={formData.tipo || 'otro'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción detallada de la tarea"
            />
          </div>

          {/* Prioridad, Estado y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad *
              </label>
              <select
                name="prioridad"
                value={formData.prioridad || 'media'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado || 'pendiente'}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                name="fecha_vencimiento"
                value={formData.fecha_vencimiento || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tiempo Estimado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiempo Estimado (minutos)
            </label>
            <input
              type="number"
              name="tiempo_estimado_minutos"
              value={formData.tiempo_estimado_minutos || 60}
              onChange={handleChange}
              min="5"
              max="1440"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Asignación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asignar a Usuarios
              </label>
              
              {!canAssignTasks() ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 text-sm">
                  No puedes asignar tareas (se creará sin asignar)
                </div>
              ) : tarea ? (
                // Modo edición: select simple
                <select
                  name="asignado_a_usuario_id"
                  value={formData.asignado_a_usuario_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Buscar usuarios..."
                          value={usuarioSearch}
                          onChange={(e) => setUsuarioSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedUsuarios.includes(usuario.id)}
                                  onChange={() => toggleUsuario(usuario.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                        <div className="p-2 text-xs text-gray-500 border-t bg-gray-50">
                          💡 Sin selección = tarea sin asignar
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={formData.ubicacion || ''}
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
                Caballos
              </label>
              
              {tarea ? (
                // Modo edición: select simple
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
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Buscar caballos..."
                          value={caballoSearch}
                          onChange={(e) => setCaballoSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto">
                        {filteredCaballos.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">
                            {caballoSearch ? 'No se encontraron caballos' : 'No hay caballos disponibles'}
                          </div>
                        ) : (
                          filteredCaballos.map(caballo => (
                            <label
                              key={caballo.id}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCaballos.includes(caballo.id)}
                                onChange={() => toggleCaballo(caballo.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm flex-1">
                                {caballo.nombre}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                      
                      {selectedCaballos.length === 0 && (
                        <div className="p-2 text-xs text-gray-500 border-t bg-gray-50">
                          💡 Sin selección = tarea general
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
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

          {/* Resumen de creación masiva */}
          {!tarea && (selectedCaballos.length > 0 || selectedUsuarios.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                📋 Resumen de creación:
              </p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Caballos: {selectedCaballos.length > 0 ? `${selectedCaballos.length} seleccionados` : 'Tarea general (sin caballo)'}
                </li>
                <li>
                  • Usuarios: {selectedUsuarios.length > 0 ? `${selectedUsuarios.length} asignados` : 'Sin asignar'}
                </li>
                <li className="font-semibold pt-1 border-t border-blue-200 mt-2">
                  → Se crearán {Math.max(1, selectedCaballos.length) * Math.max(1, selectedUsuarios.length)} tarea(s)
                </li>
              </ul>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="brand" size="sm" isLoading={loading} disabled={loading}>
              {tarea ? 'Actualizar' : 'Crear'} {!tarea && (selectedCaballos.length > 1 || selectedUsuarios.length > 1) ? 'tareas' : 'tarea'}
            </Button>
          </div>
        </form>
    </Modal>
  );
}