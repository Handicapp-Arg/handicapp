"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { LoadingSpinnerCard } from '@/components/ui/loading-spinner';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  MapPin, 
  User, 
  Calendar,
  FileText,
  Timer,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface TareaListProps {
  tareasProp?: Tarea[];
}

export function TareaList({ tareasProp }: TareaListProps) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canCreateTasks, canDeleteTasks, hasPermission } = usePermissions();

  useEffect(() => {
    // Si se pasan tareas como prop, usar esas
    if (tareasProp) {
      setTareas(tareasProp);
      setLoading(false);
    } else if (!authLoading && isAuthenticated) {
      fetchTareas();
    }
  }, [currentPage, searchTerm, authLoading, isAuthenticated, tareasProp]);

  const fetchTareas = async () => {
    if (authLoading || !isAuthenticated || tareasProp) return; // No fetch si hay tareasProp
    try {
      setLoading(true);
      const response: any = await tareaService.getAll({ page: currentPage, limit: 10, search: searchTerm });
      const tareasData = response?.data?.tareas || response?.tareas || response?.data || response || [];
      const list: Tarea[] = Array.isArray(tareasData) ? tareasData : [];
      const totalPagesData = response?.meta?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      setTareas(list);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Error loading tareas:', error);
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
        console.error('Error deleting tarea:', error);
        alert('Error al eliminar la tarea');
      }
    }
  };

  const handleCompleteTask = async (tarea: Tarea) => {
    try {
      // Crear objeto con todas las propiedades necesarias
      const updateData = {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || 'Tarea completada', // Evitar descripción vacía
        tipo: tarea.tipo as any,
        prioridad: tarea.prioridad as any,
        fecha_vencimiento: tarea.fecha_vencimiento || '',
        estado: 'completada' as any,
        caballo_id: tarea.caballo_id,
        asignado_a_usuario_id: tarea.asignado_a_usuario_id,
        establecimiento_id: tarea.establecimiento_id,
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos,
        ubicacion: tarea.ubicacion
      };
      await tareaService.update(tarea.id, updateData);
      setTareas(tareas.map(t => t.id === tarea.id ? { ...t, estado: 'completada' } : t));
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Error al completar la tarea');
    }
  };

  const handleFormSuccess = async () => {
    if (!tareasProp) {
      await fetchTareas();
    }
  };

  // Aplicar búsqueda solo si no se usan filtros externos (tareasProp)
  const filteredTareas = !tareasProp 
    ? tareas.filter(tarea =>
        tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tarea.descripcion && tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : tareas; // Si hay tareasProp, ya vienen filtradas

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (prioridad: string | undefined) => {
    if (!prioridad) return 'bg-gray-100 text-gray-800';
    
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'critica':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (estado: string | undefined) => {
    if (!estado) return 'bg-gray-100 text-gray-800';
    
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'en_progreso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tareas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinnerCard label="Cargando tareas..." variant="primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Buscador + Acción - Solo mostrar si no hay tareasProp (filtros externos) */}
      {!tareasProp && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {canCreateTasks() && (
            <button 
              onClick={handleCreateTarea}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-semibold whitespace-nowrap"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Tarea
            </button>
          )}
        </div>
      )}

      {/* Botón crear tarea cuando hay filtros externos */}
      {tareasProp && canCreateTasks() && (
        <div className="flex justify-end mb-6">
          <button 
            onClick={handleCreateTarea}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-semibold whitespace-nowrap"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Tarea
          </button>
        </div>
      )}

      <div className="max-w-7xl">
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
                <Plus className="h-5 w-5 mr-2" />
                Crear Tarea
              </button>
            )}
          </div>
        ) : (
          filteredTareas.map((tarea) => (
            <div 
              key={tarea.id} 
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 group relative overflow-hidden"
            >
              {/* Barra de color según prioridad */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                tarea.prioridad?.toLowerCase() === 'alta' || tarea.prioridad?.toLowerCase() === 'critica' 
                  ? 'bg-red-500' 
                  : tarea.prioridad?.toLowerCase() === 'media' 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}></div>

              {/* Header con título y badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{tarea.titulo}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(tarea.estado)}`}>
                      {tarea.estado === 'pendiente' ? 'Pendiente' :
                       tarea.estado === 'en_progreso' ? 'En Progreso' :
                       tarea.estado === 'completada' ? 'Completada' :
                       tarea.estado === 'cancelada' ? 'Cancelada' : tarea.estado}
                    </span>
                    {tarea.prioridad && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityColor(tarea.prioridad)}`}>
                        {tarea.prioridad === 'critica' ? 'Crítica' : 
                         tarea.prioridad === 'alta' ? 'Alta' :
                         tarea.prioridad === 'media' ? 'Media' : 'Baja'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {tarea.estado !== 'completada' && hasPermission('tasks:complete') && (
                    <button 
                      onClick={() => handleCompleteTask(tarea)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Completar"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {canCreateTasks() && (
                    <button 
                      onClick={() => handleEditTarea(tarea)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {canDeleteTasks() && (
                    <button 
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Descripción */}
              {tarea.descripcion && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tarea.descripcion}</p>
              )}
              
              {/* Grid de información */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span className="font-medium mr-1">Tipo:</span> 
                  <span className="capitalize">{tarea.tipo}</span>
                </div>
                
                {tarea.fecha_vencimiento && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Vence:</span> 
                    <span>{formatDate(tarea.fecha_vencimiento)}</span>
                  </div>
                )}
                
                {tarea.asignado_a && (
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Asignado:</span> 
                    <span className="truncate">{tarea.asignado_a.nombre} {tarea.asignado_a.apellido}</span>
                  </div>
                )}
                
                {tarea.caballo && (
                  <div className="flex items-center text-gray-600">
                    <Sparkles className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Caballo:</span> 
                    <span className="truncate">{tarea.caballo.nombre}</span>
                  </div>
                )}
                
                {tarea.ubicacion && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Ubicación:</span> 
                    <span className="truncate">{tarea.ubicacion}</span>
                  </div>
                )}
                
                {tarea.tiempo_estimado_minutos && (
                  <div className="flex items-center text-gray-600">
                    <Timer className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                    <span className="font-medium mr-1">Tiempo:</span> 
                    <span>{tarea.tiempo_estimado_minutos} min</span>
                  </div>
                )}
              </div>

              {/* Indicador de solo lectura */}
              {!hasPermission('tasks:complete') && !canCreateTasks() && !canDeleteTasks() && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    Solo lectura
                  </span>
                </div>
              )}
            </div>
          ))
        )}
        </div>
      </div>
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages || loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
      
      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea || undefined}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}