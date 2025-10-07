"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/utils/logger';

export function TareaList() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canCreateTasks, canDeleteTasks, hasPermission, getUserRole } = usePermissions();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchTareas();
    }
  }, [currentPage, searchTerm, authLoading, isAuthenticated]);

  const fetchTareas = async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      setLoading(true);
      const response: any = await tareaService.getAll({ page: currentPage, limit: 10, search: searchTerm });
      const tareasData = response?.data?.tareas || response?.tareas || response?.data || response || [];
      const list: Tarea[] = Array.isArray(tareasData) ? tareasData : [];
      const totalPagesData = response?.meta?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      setTareas(list);
      setTotalPages(totalPagesData);
    } catch (error) {
      logger.error('Error loading tareas:', error);
      setTareas([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTarea = () => {
    setSelectedTarea(null);
    setShowForm(true);
  };

  const handleEditTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowForm(true);
  };

  const handleDeleteTarea = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await tareaService.delete(id);
        setTareas(tareas.filter(t => t.id !== id));
      } catch (error) {
        logger.error('Error deleting tarea:', error);
        alert('Error al eliminar la tarea');
      }
    }
  };

  const handleCompleteTask = async (tarea: Tarea) => {
    try {
      // Crear objeto con propiedades que coincidan con CreateTareaData
      const updateData = {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        tipo: tarea.tipo as any, // Se necesita cast porque los tipos pueden diferir
        prioridad: tarea.prioridad as any
      };
      await tareaService.update(tarea.id, updateData);
      setTareas(tareas.map(t => t.id === tarea.id ? { ...t, estado: 'completada' } : t));
    } catch (error) {
      logger.error('Error completing task:', error);
      alert('Error al completar la tarea');
    }
  };

  const handleFormSuccess = async () => {
    await fetchTareas();
  };

  const filteredTareas = tareas.filter(tarea =>
    tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tareas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando tareas...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Buscador + Acción */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {canCreateTasks() && (
          <button 
            onClick={handleCreateTarea}
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Tarea
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTareas.length === 0 ? (
          <div className="text-center py-16 w-full col-span-full">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay tareas</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'No se encontraron tareas que coincidan con tu búsqueda.' : 'Crea tu primera tarea para comenzar.'}
            </p>
            {!searchTerm && canCreateTasks() && (
              <button 
                onClick={handleCreateTarea}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Crear Tarea
              </button>
            )}
          </div>
        ) : (
          filteredTareas.map((tarea) => (
            <div key={tarea.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{tarea.titulo}</h3>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tarea.prioridad)}`}>
                        {tarea.prioridad}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tarea.estado)}`}>
                        {tarea.estado.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  {tarea.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">{tarea.descripcion}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">📋 Tipo:</span> {tarea.tipo}
                    </p>
                    {tarea.fecha_vencimiento && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">⏰ Vencimiento:</span> {formatDate(tarea.fecha_vencimiento)}
                      </p>
                    )}
                    {tarea.asignado_a && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">👤 Asignado a:</span> {tarea.asignado_a.nombre} {tarea.asignado_a.apellido}
                      </p>
                    )}
                    {tarea.caballo && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">🐎 Caballo:</span> {tarea.caballo.nombre}
                      </p>
                    )}
                    {tarea.ubicacion && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">📍 Ubicación:</span> {tarea.ubicacion}
                      </p>
                    )}
                    {tarea.tiempo_estimado_minutos && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">⏱️ Tiempo estimado:</span> {tarea.tiempo_estimado_minutos} min
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {/* Botón Completar: empleados, capataces y veterinarios pueden completar */}
                  {tarea.estado !== 'completada' && hasPermission('tasks:complete') && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleCompleteTask(tarea)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700"
                    >
                      <CheckIcon className="h-3 w-3" />
                      Completar
                    </Button>
                  )}
                  {/* Botón Editar: solo roles con permisos de escritura */}
                  {canCreateTasks() && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleEditTarea(tarea)}
                      className="flex items-center gap-1"
                    >
                      <PencilIcon className="h-3 w-3" />
                      Editar
                    </Button>
                  )}
                  {/* Botón Eliminar: solo admin y capataz */}
                  {canDeleteTasks() && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Eliminar
                    </Button>
                  )}
                  {/* Indicador de solo lectura */}
                  {!hasPermission('tasks:complete') && !canCreateTasks() && !canDeleteTasks() && (
                    <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      Solo lectura
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading}>Anterior</Button>
          <span className="flex items-center px-4 text-sm text-gray-600">Página {currentPage} de {totalPages}</span>
          <Button variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading}>Siguiente</Button>
        </div>
      )}
      
      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}