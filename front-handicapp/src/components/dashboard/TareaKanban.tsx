'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService } from '@/lib/services/taskService';
import { type Tarea, type EstadoTarea, type VistaKanban } from '@/types/task.types';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { logger } from '@/lib/utils/logger';

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
  /** Modo compacto para mostrar en tabs de caballo */
  compactMode?: boolean;
  /** ID del caballo para filtrar tareas (opcional) */
  caballoId?: number;
  /** Mostrar información del caballo en las tarjetas */
  showCaballoInfo?: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// --- Extracted sub-components ---

interface TareaCardProps {
  tarea: Tarea;
  showCaballoInfo: boolean;
  onCardClick: (tarea: Tarea) => void;
}

function TareaCard({ tarea, showCaballoInfo, onCardClick }: TareaCardProps) {
  return (
    <div
      className="bg-white rounded-md p-3.5 hover:bg-gray-50 cursor-pointer border border-gray-200"
      onClick={() => onCardClick(tarea)}
    >
      {/* Header: Título y avatar */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
          {tarea.titulo}
        </h4>
        {tarea.asignado_a && (
          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[9px] font-semibold flex-shrink-0">
            {tarea.asignado_a.nombre?.charAt(0)?.toUpperCase()}{tarea.asignado_a.apellido?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>

      {/* Caballo */}
      {showCaballoInfo && tarea.caballo && (
        <div className="mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {tarea.caballo.nombre}
          </span>
        </div>
      )}

      {/* Descripción */}
      {tarea.descripcion && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">
          {tarea.descripcion}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        {tarea.fecha_vencimiento && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(tarea.fecha_vencimiento)}</span>
          </div>
        )}

        {tarea.prioridad && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            tarea.prioridad === 'alta' || tarea.prioridad === 'critica'
              ? 'bg-red-50 text-red-700'
              : tarea.prioridad === 'media'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-green-50 text-green-700'
          }`}>
            {tarea.prioridad === 'critica' ? 'Crítica' :
             tarea.prioridad === 'alta' ? 'Alta' :
             tarea.prioridad === 'media' ? 'Media' : 'Baja'}
          </span>
        )}
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tareas: Tarea[];
  estado: EstadoTarea;
  isMobile: boolean;
  showCaballoInfo: boolean;
  expandedColumns: Set<string>;
  onToggleColumn: (estado: string) => void;
  onCardClick: (tarea: Tarea) => void;
}

function KanbanColumn({
  title,
  tareas: columnTareas,
  estado,
  isMobile,
  showCaballoInfo,
  expandedColumns,
  onToggleColumn,
  onCardClick,
}: KanbanColumnProps) {
  const isExpanded = expandedColumns.has(estado);

  const getBadgeColor = () => {
    if (estado === 'completada') return 'bg-green-50 text-green-700';
    if (estado === 'en_progreso') return 'bg-amber-50 text-amber-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex flex-col">
      {/* Header de columna */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-semibold text-sm text-gray-700">{title}</h3>
            <span className={`${getBadgeColor()} text-xs font-medium px-2.5 py-1 rounded-md`}>
              {columnTareas.length}
            </span>
          </div>
          {isMobile && (
            <button
              onClick={() => onToggleColumn(estado)}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
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
          isMobile
            ? isExpanded
              ? 'min-h-[300px] max-h-[600px] block'
              : 'hidden'
            : 'min-h-[500px] max-h-[calc(100vh-320px)]'
        }`}
      >
        <div className="space-y-3">
          {columnTareas.map((tarea) => (
            <TareaCard key={tarea.id} tarea={tarea} showCaballoInfo={showCaballoInfo} onCardClick={onCardClick} />
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main component ---

export function TareaKanban({
  tareas: tareasProp,
  onRefresh,
  compactMode = false,
  caballoId,
  showCaballoInfo = true
}: TareaKanbanProps) {
  void caballoId;
  const [searchTerm] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [sortBy, setSortBy] = useState('fecha');
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [localTareas, setLocalTareas] = useState<Tarea[]>([]);
  const localTareasRef = useRef<Tarea[]>([]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set(['pendiente']));
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<VistaKanban>('todas');
  const [showFilters, setShowFilters] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTarea, setDetailTarea] = useState<Tarea | null>(null);
  const { user } = useAuthNew();
  const { canCreateTasks, canDeleteTasks } = usePermissions();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const tareasArray = Array.isArray(tareasProp) ? tareasProp : (tareasProp as { data: Tarea[] })?.data || [];
    localTareasRef.current = tareasArray;
    setLocalTareas(tareasArray);
  }, [tareasProp]);

  const silentRefresh = useCallback(async () => {
    try {
      const response = await tareaService.getAll({ page: 1, limit: 50 });
      const tareasData = response.data;
      if (tareasData !== localTareasRef.current) {
        localTareasRef.current = tareasData;
        setLocalTareas(tareasData);
      }
    } catch {
      // Silencioso
    }
  }, []);

  useAutoRefresh(silentRefresh, {
    interval: 60000,
    enabled: true,
    onlyWhenVisible: true
  });

  const organizedTareas = useMemo(() => {
    const PRIORIDAD_ORDER: Record<string, number> = { critica: 0, alta: 1, media: 2, baja: 3 };

    let filtered = localTareas.filter((t: Tarea) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch = t.titulo?.toLowerCase().includes(search) ||
          t.descripcion?.toLowerCase().includes(search) ||
          t.tipo?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      if (filterPrioridad && t.prioridad !== filterPrioridad) return false;
      return true;
    });

    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'prioridad') {
        return (PRIORIDAD_ORDER[a.prioridad ?? 'media'] ?? 2) - (PRIORIDAD_ORDER[b.prioridad ?? 'media'] ?? 2);
      }
      if (sortBy === 'titulo') {
        return (a.titulo ?? '').localeCompare(b.titulo ?? '');
      }
      if (sortBy === 'creacion') {
        return new Date(b.creado_el ?? 0).getTime() - new Date(a.creado_el ?? 0).getTime();
      }
      // default: fecha de vencimiento
      const aDate = a.fecha_vencimiento ? new Date(a.fecha_vencimiento).getTime() : Infinity;
      const bDate = b.fecha_vencimiento ? new Date(b.fecha_vencimiento).getTime() : Infinity;
      return aDate - bDate;
    });

    return {
      todas: filtered,
      pendiente: filtered.filter((t: Tarea) => t.estado === 'pendiente'),
      en_progreso: filtered.filter((t: Tarea) => t.estado === 'en_progreso'),
      completada: filtered.filter((t: Tarea) => t.estado === 'completada'),
      cancelada: filtered.filter((t: Tarea) => t.estado === 'cancelada'),
      vencida: filtered.filter((t: Tarea) => t.estado === 'vencida'),
    };
  }, [localTareas, searchTerm, filterPrioridad, sortBy]);

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
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">¿Eliminar esta tarea?</span>
        <button
          className="px-3 py-1 bg-red-600 text-white text-xs rounded-md font-medium"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const tareaId = typeof id === 'string' ? parseInt(id.replace(/\D/g, '')) : id;
              await tareaService.delete(tareaId);
              setLocalTareas(prev => prev.filter(tarea => tarea.id !== id));
              toast.success('Tarea eliminada correctamente');
            } catch (error) {
              logger.error('Error deleting tarea:', error);
              toast.error('Error al eliminar la tarea');
            }
          }}
        >
          Eliminar
        </button>
        <button
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancelar
        </button>
      </span>
    ), { duration: 6000 });
  };

  const handleChangeEstado = async (tarea: Tarea, nuevoEstado: EstadoTarea) => {
    try {
      const tareaId = typeof tarea.id === 'string'
        ? parseInt((tarea.id as string).replace(/\D/g, ''))
        : tarea.id;
      await tareaService.changeEstado(tareaId, nuevoEstado);
      setLocalTareas(prev => prev.map(t =>
        t.id === tarea.id ? { ...t, estado: nuevoEstado } : t
      ));
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      logger.error('Error updating estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleFormSuccess = async () => {
    try {
      const response = await tareaService.getAll({ page: 1, limit: 100 });
      const tareasData = response.data;
      setLocalTareas(tareasData);
      toast.success(selectedTarea ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      logger.error('Error reloading tareas:', error);
      toast.error('Error al recargar tareas');
    } finally {
      setShowForm(false);
      setSelectedTarea(null);
    }
  };

  const handleCardClick = (tarea: Tarea) => {
    setDetailTarea(tarea);
    setShowDetailModal(true);
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

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden w-full">
        {/* Header */}
        {!compactMode && (
          <div className="border-b border-gray-100">
            <div className="px-4 sm:px-6 pt-4 pb-3">
              <h2 className="text-xl font-semibold text-gray-800">Mis Tareas</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 pb-4">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                {([
                  { key: 'todas', label: 'Todas', count: tabCounts.todas },
                  { key: 'pendiente', label: 'Pendiente', count: tabCounts.pendiente },
                  { key: 'en_progreso', label: 'En Progreso', count: tabCounts.en_progreso },
                  { key: 'completada', label: 'Completadas', count: tabCounts.completada },
                ] as { key: VistaKanban; label: string; count: number }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${
                      activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-medium rounded-md border border-gray-200"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filtros y Orden</span>
                  <span className="sm:hidden">Filtros</span>
                </button>

                {canCreateTasks() && (
                  <button
                    onClick={handleCreateTarea}
                    className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium rounded-md"
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
        )}

        {/* Panel de filtros */}
        {showFilters && !compactMode && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prioridad</label>
                <select
                  value={filterPrioridad}
                  onChange={(e) => setFilterPrioridad(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-300 outline-none bg-white"
                >
                  <option value="">Todas</option>
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Asignado a</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900/10 outline-none bg-white">
                  <option value="">Todos</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-300 outline-none bg-white"
                >
                  <option value="fecha">Fecha de vencimiento</option>
                  <option value="prioridad">Prioridad</option>
                  <option value="titulo">Título</option>
                  <option value="creacion">Fecha de creación</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Columnas del Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-100">
          {(activeTab === 'todas' || activeTab === 'pendiente') && (
            <KanbanColumn
              title="Pendiente"
              icon={Clock}
              tareas={organizedTareas.pendiente}
              estado="pendiente"
              isMobile={isMobile}
              showCaballoInfo={showCaballoInfo}
              expandedColumns={expandedColumns}
              onToggleColumn={toggleColumn}
              onCardClick={handleCardClick}
            />
          )}
          {(activeTab === 'todas' || activeTab === 'en_progreso') && (
            <KanbanColumn
              title="En Progreso"
              icon={PlayCircle}
              tareas={organizedTareas.en_progreso}
              estado="en_progreso"
              isMobile={isMobile}
              showCaballoInfo={showCaballoInfo}
              expandedColumns={expandedColumns}
              onToggleColumn={toggleColumn}
              onCardClick={handleCardClick}
            />
          )}
          {(activeTab === 'todas' || activeTab === 'completada') && (
            <KanbanColumn
              title="Completadas"
              icon={CheckCircle2}
              tareas={organizedTareas.completada}
              estado="completada"
              isMobile={isMobile}
              showCaballoInfo={showCaballoInfo}
              expandedColumns={expandedColumns}
              onToggleColumn={toggleColumn}
              onCardClick={handleCardClick}
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
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Tarea</DialogTitle>
          </DialogHeader>

          {detailTarea && (
            <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-1">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Título</label>
                <p className="text-base text-gray-800">{detailTarea.titulo}</p>
              </div>

              {/* Descripción */}
              {detailTarea.descripcion && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{detailTarea.descripcion}</p>
                </div>
              )}

              {/* Info en grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Estado</label>
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                    detailTarea.estado === 'completada' ? 'bg-green-50 text-green-700' :
                    detailTarea.estado === 'en_progreso' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {detailTarea.estado === 'completada' ? 'Completada' :
                     detailTarea.estado === 'en_progreso' ? 'En Progreso' :
                     'Pendiente'}
                  </span>
                </div>

                {/* Prioridad */}
                {detailTarea.prioridad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Prioridad</label>
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium ${
                      detailTarea.prioridad === 'alta' || detailTarea.prioridad === 'critica'
                        ? 'bg-red-50 text-red-700'
                        : detailTarea.prioridad === 'media'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-50 text-green-700'
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
                    <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Vencimiento</label>
                    <p className="text-sm text-gray-800">{formatDate(detailTarea.fecha_vencimiento)}</p>
                  </div>
                )}

                {/* Tipo */}
                {detailTarea.tipo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
                    <p className="text-sm text-gray-800">{getTipoLabel(detailTarea.tipo)}</p>
                  </div>
                )}

                {/* Caballo */}
                {detailTarea.caballo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Caballo</label>
                    <p className="text-sm text-gray-800">{detailTarea.caballo.nombre}</p>
                  </div>
                )}

                {/* Asignado a */}
                {detailTarea.asignado_a && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Asignado a</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold">
                        {detailTarea.asignado_a.nombre?.charAt(0)?.toUpperCase()}{detailTarea.asignado_a.apellido?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-800">{detailTarea.asignado_a.nombre} {detailTarea.asignado_a.apellido}</span>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                {detailTarea.ubicacion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Ubicación</label>
                    <p className="text-sm text-gray-800">{detailTarea.ubicacion}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {canCreateTasks() && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditTarea(detailTarea);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium rounded-md"
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
                    className="px-4 py-2.5 text-red-600 hover:bg-red-50 border border-gray-200 text-sm font-medium rounded-md"
                  >
                    Eliminar
                  </button>
                )}
                {user && user.rol?.clave !== 'propietario' && (user.rol?.clave === 'establecimiento' || detailTarea.creado_por === user.id || detailTarea.asignado_a === user.id) && (
                  <>
                    {detailTarea.estado === 'pendiente' && (
                      <button
                        onClick={() => {
                          handleChangeEstado(detailTarea, 'en_progreso');
                          setShowDetailModal(false);
                        }}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md"
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
                        className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
                      >
                        Completar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
