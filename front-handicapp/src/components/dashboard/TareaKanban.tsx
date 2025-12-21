'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService } from '@/lib/services/tareaService';
import { type Tarea, type EstadoTarea, type VistaKanban } from '@/types/task.types';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import {
  Plus,
  Edit2,
  CheckCircle2,
  Clock,
  Calendar,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';

// Helper para traducir tipos de tarea
const getTipoLabel = (tipo: string): string => {
  const tipos: Record<string, string> = {
    'alimentacion': 'Alimentación',
    'limpieza_box': 'Limpieza de Box',
    'aseo_caballo': 'Aseo del Caballo',
    'ejercicio': 'Ejercicio',
    'salud': 'Salud',
    'entrenamiento': 'Entrenamiento',
    'mantenimiento': 'Mantenimiento',
    'reparacion': 'Reparación',
    'limpieza_general': 'Limpieza General',
    'compras': 'Compras',
    'otro': 'Otro'
  };
  return tipos[tipo] || tipo;
};

interface TareaKanbanProps {
  tareas: Tarea[] | { data: Tarea[] };
  onRefresh?: () => void;
}

export function TareaKanban({ tareas: tareasProp, onRefresh }: TareaKanbanProps) {
  const [searchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [localTareas, setLocalTareas] = useState<Tarea[]>([]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set(['pendiente'])); // Por defecto abierta la primera
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<VistaKanban>('todas');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTarea, setDetailTarea] = useState<Tarea | null>(null);
  const { user } = useAuthNew();
  const { canCreateTasks, canDeleteTasks } = usePermissions();

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // El backend espera y devuelve los estados en español directamente

  // Sincronizar tareas locales con props
  useEffect(() => {
    const tareasArray = Array.isArray(tareasProp) ? tareasProp : (tareasProp as { data: Tarea[] })?.data || [];
    setLocalTareas(tareasArray);
  }, [tareasProp]);

  // Función para refrescar tareas silenciosamente (sin toast ni loading)
  const silentRefresh = useCallback(async () => {
    try {
      const response = await tareaService.getAll({ page: 1, limit: 500 });
      const tareasData = response.data;
      
      // Solo actualizar si hay cambios reales
      if (JSON.stringify(tareasData) !== JSON.stringify(localTareas)) {
        setLocalTareas(tareasData);
      }
    } catch (error) {
      // Silencioso - no mostrar errores al usuario
      console.debug('Auto-refresh falló (silencioso):', error);
    }
  }, [localTareas]);

  // Auto-refresh cada 60 segundos cuando la pestaña está activa
  useAutoRefresh(silentRefresh, {
    interval: 60000, // 1 minuto
    enabled: true,
    onlyWhenVisible: true
  });

  // Organizar tareas por estado
  const organizedTareas = useMemo(() => {
    const filteredBySearch = localTareas.filter((t: Tarea) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        t.titulo?.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search) ||
        t.tipo?.toLowerCase().includes(search)
      );
    });

    return {
      todas: filteredBySearch,
      pendiente: filteredBySearch.filter((t: Tarea) => t.estado === 'pendiente'),
      en_progreso: filteredBySearch.filter((t: Tarea) => t.estado === 'en_progreso'),
      completada: filteredBySearch.filter((t: Tarea) => t.estado === 'completada'),
      cancelada: filteredBySearch.filter((t: Tarea) => t.estado === 'cancelada'),
      vencida: filteredBySearch.filter((t: Tarea) => t.estado === 'vencida'),
    };
  }, [localTareas, searchTerm]);

  // Calcular contadores para tabs
  const tabCounts = useMemo(() => ({
    todas: localTareas.length,
    pendiente: localTareas.filter(t => t.estado === 'pendiente').length,
    en_progreso: localTareas.filter(t => t.estado === 'en_progreso').length,
    completada: localTareas.filter(t => t.estado === 'completada').length,
    vencida: localTareas.filter(t => t.estado === 'vencida').length,
  }), [localTareas]);

  const handleCreateTarea = () => {
    setSelectedTarea(null);
    setShowForm(true);
  };

  const handleEditTarea = (tarea: Tarea) => {
    setSelectedTarea(tarea);
    setShowForm(true);
  };

  const handleDeleteTarea = async (id: number | string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        // Asegurar que el ID sea numérico
        const tareaId = typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : id;
        await tareaService.delete(tareaId);
        setLocalTareas(prev => prev.filter(t => t.id !== id));
        toast.success('Tarea eliminada correctamente');
      } catch (error) {
        console.error('Error deleting tarea:', error);
        toast.error('Error al eliminar la tarea');
      }
    }
  };

  const handleChangeEstado = async (tarea: Tarea, nuevoEstado: EstadoTarea) => {
    try {
      // Asegurar que el ID sea numérico
      const tareaId = typeof tarea.id === 'string' 
        ? parseInt((tarea.id as string).replace(/\D/g, '')) 
        : tarea.id;
      
      // El backend espera el estado en español directamente
      await tareaService.changeEstado(tareaId, nuevoEstado);
      
      // Actualizar estado local sin recargar
      setLocalTareas(prev => prev.map(t => 
        t.id === tarea.id ? { ...t, estado: nuevoEstado } : t
      ));
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleFormSuccess = async () => {
    try {
      // Recargar las tareas para obtener los datos actualizados
      const response = await tareaService.getAll({ page: 1, limit: 500 });
      const tareasData = response.data;
      setLocalTareas(tareasData);
      
      // Mostrar mensaje de éxito
      toast.success(selectedTarea ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
      
      // Si hay callback del padre, llamarlo también
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error reloading tareas:', error);
      toast.error('Error al recargar tareas');
    } finally {
      // Cerrar formulario siempre
      setShowForm(false);
      setSelectedTarea(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const TareaCard = ({ tarea }: { tarea: Tarea }) => {
    const handleCardClick = () => {
      setDetailTarea(tarea);
      setShowDetailModal(true);
    };
    
    return (
      <div 
        className="bg-white rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
        onClick={handleCardClick}
      >
        {/* Header: Título y avatar en la misma línea */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug flex-1">
            {tarea.titulo}
          </h4>
          {/* Avatar del usuario asignado */}
          {tarea.asignado_a && (
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-semibold shadow-sm flex-shrink-0">
              {tarea.asignado_a.nombre?.charAt(0)?.toUpperCase()}{tarea.asignado_a.apellido?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Descripción en el medio */}
        {tarea.descripcion && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2.5 leading-relaxed">
            {tarea.descripcion}
          </p>
        )}

        {/* Footer: Fecha y badge de prioridad */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
          {/* Fecha */}
          {tarea.fecha_vencimiento && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(tarea.fecha_vencimiento)}</span>
            </div>
          )}

          {/* Badge de prioridad */}
          {tarea.prioridad && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
              tarea.prioridad === 'alta' || tarea.prioridad === 'critica'
                ? 'bg-red-50 text-red-700'
                : tarea.prioridad === 'media'
                ? 'bg-orange-50 text-orange-700'
                : 'bg-emerald-50 text-emerald-700'
            }`}>
              {tarea.prioridad === 'critica' ? 'Crítica' : 
               tarea.prioridad === 'alta' ? 'Alta' :
               tarea.prioridad === 'media' ? 'Media' : 'Baja'}
            </span>
          )}
        </div>

      </div>
    );
  };

  const toggleColumn = (estado: string) => {
    setExpandedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(estado)) {
        newSet.delete(estado);
      } else {
        newSet.add(estado);
      }
      return newSet;
    });
  };

  const KanbanColumn = ({ 
    title, 
    tareas: columnTareas,
    estado,
    isMobile: isMobileProp
  }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    tareas: Tarea[];
    estado: EstadoTarea;
    isMobile: boolean;
  }) => {
    const isExpanded = expandedColumns.has(estado);

    // Definir color del contador según el estado
    const getBadgeColor = () => {
      if (estado === 'completada') return 'bg-emerald-100 text-emerald-700';
      if (estado === 'en_progreso') return 'bg-amber-100 text-amber-700';
      return 'bg-gray-100 text-gray-700';
    };

    return (
      <div className="flex flex-col">
        {/* Header de columna */}
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
              <span className={`${getBadgeColor()} text-xs font-medium px-2.5 py-1 rounded-md`}>
                {columnTareas.length}
              </span>
            </div>
            {isMobileProp && (
              <button
                onClick={() => toggleColumn(estado)}
                className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                type="button"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Contenido de columna */}
        <div 
          className={`px-4 pb-4 pt-4 overflow-y-auto ${
            isMobileProp 
              ? isExpanded 
                ? 'min-h-[300px] max-h-[600px] block' 
                : 'hidden'
              : 'min-h-[500px] max-h-[calc(100vh-320px)]'
          } transition-all duration-200`}
        >
          <div className="space-y-3">
            {columnTareas.map((tarea) => (
              <TareaCard key={tarea.id} tarea={tarea} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Determinar título según el rol del usuario
  const getKanbanTitle = () => {
    if (user?.rol?.clave === 'propietario') {
      return 'Mis Solicitudes';
    }
    return 'Kanban de Tareas';
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      {/* Kanban Board - Contenedor unificado con header integrado */}
      <div className="bg-white rounded-lg border border-stroke overflow-hidden w-full shadow-sm">
        {/* Header con título, tabs y botón */}
        <div className="border-b border-stroke">
          {/* Título */}
          <div className="px-4 sm:px-6 pt-4 pb-3">
            <h2 className="text-xl font-semibold text-gray-900">{getKanbanTitle()}</h2>
          </div>
          
          {/* Tabs y botones */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 pb-4">
          {/* Tabs - Scroll horizontal en móvil */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setActiveTab('todas')}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'todas'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
              <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                activeTab === 'todas' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tabCounts.todas}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pendiente')}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'pendiente'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pendiente
              <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                activeTab === 'pendiente' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tabCounts.pendiente}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('en_progreso')}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'en_progreso'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              En Progreso
              <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                activeTab === 'en_progreso' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tabCounts.en_progreso}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completada')}
              className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'completada'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completadas
              <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                activeTab === 'completada' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tabCounts.completada}
              </span>
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium rounded-lg border border-gray-300 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros y Orden</span>
              <span className="sm:hidden">Filtros</span>
            </button>
            
            {canCreateTasks() && (
              <button 
                onClick={handleCreateTarea}
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {user?.rol?.clave === 'propietario' ? 'Nueva Solicitud' : 'Nueva Tarea'}
                </span>
                <span className="sm:hidden">Nueva</span>
              </button>
            )}
          </div>
        </div>
        </div>

        {/* Panel de filtros (si está abierto) */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-stroke">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Prioridad</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                  <option value="">Todas</option>
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Asignado a</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                  <option value="">Todos</option>
                  {/* Aquí puedes agregar la lista de usuarios */}
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Ordenar por</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                  <option value="fecha">Fecha de vencimiento</option>
                  <option value="prioridad">Prioridad</option>
                  <option value="titulo">Título</option>
                  <option value="creacion">Fecha de creación</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Columnas del Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-stroke">
          {(activeTab === 'todas' || activeTab === 'pendiente') && (
            <KanbanColumn
              title="Pendiente"
              icon={Clock}
              tareas={organizedTareas.pendiente}
              estado="pendiente"
              isMobile={isMobile}
            />
          )}
          {(activeTab === 'todas' || activeTab === 'en_progreso') && (
            <KanbanColumn
              title="En Progreso"
              icon={PlayCircle}
              tareas={organizedTareas.en_progreso}
              estado="en_progreso"
              isMobile={isMobile}
            />
          )}
          {(activeTab === 'todas' || activeTab === 'completada') && (
            <KanbanColumn
              title="Completadas"
              icon={CheckCircle2}
              tareas={organizedTareas.completada}
              estado="completada"
              isMobile={isMobile}
            />
          )}
        </div>
      </div>
      
      {/* Modal de edición */}
      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea || undefined}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de detalles */}
      {showDetailModal && detailTarea && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detalles de la Tarea</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 space-y-6">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <p className="text-base text-gray-900">{detailTarea.titulo}</p>
              </div>

              {/* Descripción */}
              {detailTarea.descripcion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{detailTarea.descripcion}</p>
                </div>
              )}

              {/* Info en grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                    detailTarea.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                    detailTarea.estado === 'en_progreso' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {detailTarea.estado === 'completada' ? 'Completada' :
                     detailTarea.estado === 'en_progreso' ? 'En Progreso' :
                     'Pendiente'}
                  </span>
                </div>

                {/* Prioridad */}
                {detailTarea.prioridad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                      detailTarea.prioridad === 'alta' || detailTarea.prioridad === 'critica'
                        ? 'bg-red-100 text-red-700'
                        : detailTarea.prioridad === 'media'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {detailTarea.prioridad === 'critica' ? 'Crítica' : 
                       detailTarea.prioridad === 'alta' ? 'Alta' :
                       detailTarea.prioridad === 'media' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                )}

                {/* Fecha de vencimiento */}
                {detailTarea.fecha_vencimiento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
                    <p className="text-sm text-gray-900">{formatDate(detailTarea.fecha_vencimiento)}</p>
                  </div>
                )}

                {/* Tipo */}
                {detailTarea.tipo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <p className="text-sm text-gray-900">{getTipoLabel(detailTarea.tipo)}</p>
                  </div>
                )}

                {/* Caballo */}
                {detailTarea.caballo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Caballo</label>
                    <p className="text-sm text-gray-900">{detailTarea.caballo.nombre}</p>
                  </div>
                )}

                {/* Asignado a */}
                {detailTarea.asignado_a && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                        {detailTarea.asignado_a.nombre?.charAt(0)?.toUpperCase()}{detailTarea.asignado_a.apellido?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">{detailTarea.asignado_a.nombre} {detailTarea.asignado_a.apellido}</span>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {detailTarea.ubicacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <p className="text-sm text-gray-900">{detailTarea.ubicacion}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {canCreateTasks() && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditTarea(detailTarea);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Tarea
                  </button>
                )}
                {canDeleteTasks() && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteTarea(detailTarea.id);
                    }}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                {/* Botones de cambio de estado - Solo para roles operativos (NO propietario) */}
                {user && user.rol?.clave !== 'propietario' && (user.rol?.clave === 'establecimiento' || detailTarea.creado_por === user.id || detailTarea.asignado_a === user.id) && (
                  <>
                    {detailTarea.estado === 'pendiente' && (
                      <button
                        onClick={() => {
                          handleChangeEstado(detailTarea, 'en_progreso');
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Iniciar
                      </button>
                    )}
                    {detailTarea.estado === 'en_progreso' && (
                      <button
                        onClick={() => {
                          handleChangeEstado(detailTarea, 'completada');
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Completar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

