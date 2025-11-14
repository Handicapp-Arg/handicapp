'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  User, 
  Calendar,
  FileText,
  Timer,
  PlayCircle,
  Sparkles,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import toast from 'react-hot-toast';

interface TareaKanbanProps {
  tareas: Tarea[] | any;
}

// Mapear estados del backend a estados de UI
const normalizeEstado = (estado: string | undefined): 'open' | 'in_progress' | 'done' | 'cancelled' => {
  if (!estado) return 'open';
  const normalized = estado.toLowerCase();
  if (normalized === 'pendiente') return 'open';
  if (normalized === 'en_progreso') return 'in_progress';
  if (normalized === 'completada') return 'done';
  if (normalized === 'cancelada') return 'cancelled';
  return normalized as 'open' | 'in_progress' | 'done' | 'cancelled';
};

// Mapear estados de UI a estados del backend
const denormalizeEstado = (estado: 'open' | 'in_progress' | 'done' | 'cancelled'): string => {
  return estado;
};

export function TareaKanban({ tareas: tareasProp }: TareaKanbanProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const [localTareas, setLocalTareas] = useState<Tarea[]>([]);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set(['open'])); // Por defecto abierta la primera
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canCreateTasks, canDeleteTasks, hasPermission } = usePermissions();

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sincronizar tareas locales con props
  useEffect(() => {
    const tareasArray = Array.isArray(tareasProp) ? tareasProp : (tareasProp as any)?.data || [];
    setLocalTareas(tareasArray);
  }, [tareasProp]);

  // Normalizar y organizar tareas por estado
  const organizedTareas = useMemo(() => {
    const normalized = localTareas.map((t: any) => ({
      ...t,
      estadoNormalizado: normalizeEstado(t.estado)
    }));

    const filtered = normalized.filter((t: any) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        t.titulo?.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search) ||
        t.tipo?.toLowerCase().includes(search)
      );
    });

    return {
      open: filtered.filter((t: any) => t.estadoNormalizado === 'open'),
      in_progress: filtered.filter((t: any) => t.estadoNormalizado === 'in_progress'),
      done: filtered.filter((t: any) => t.estadoNormalizado === 'done'),
      cancelled: filtered.filter((t: any) => t.estadoNormalizado === 'cancelled'),
    };
  }, [localTareas, searchTerm]);

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
        setLocalTareas(prev => prev.filter(t => t.id !== id));
        toast.success('Tarea eliminada correctamente');
      } catch (error) {
        console.error('Error deleting tarea:', error);
        toast.error('Error al eliminar la tarea');
      }
    }
  };

  const handleChangeEstado = async (tarea: Tarea, nuevoEstado: 'open' | 'in_progress' | 'done') => {
    try {
      const estadoBackend = denormalizeEstado(nuevoEstado);
      const updateData = {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || '',
        tipo: tarea.tipo as any,
        prioridad: tarea.prioridad as any,
        fecha_vencimiento: tarea.fecha_vencimiento || '',
        estado: estadoBackend as any,
        caballo_id: tarea.caballo_id,
        asignado_a_usuario_id: tarea.asignado_a_usuario_id,
        establecimiento_id: tarea.establecimiento_id,
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos,
        ubicacion: tarea.ubicacion
      };
      await tareaService.update(tarea.id, updateData);
      // Actualizar estado local sin recargar
      setLocalTareas(prev => prev.map(t => 
        t.id === tarea.id ? { ...t, estado: estadoBackend as any } : t
      ));
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleFormSuccess = async () => {
    // Recargar datos después de crear/editar
    try {
      const response: any = await tareaService.getAll({ page: 1, limit: 500 });
      const tareasData = response?.data?.tareas || response?.tareas || response?.data || response || [];
      setLocalTareas(Array.isArray(tareasData) ? tareasData : []);
      setShowForm(false);
      setSelectedTarea(null);
    } catch (error) {
      console.error('Error reloading tareas:', error);
      // Fallback: recargar página
      window.location.reload();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (prioridad: string | undefined) => {
    if (!prioridad) return 'bg-gray-100 text-gray-800';
    
    switch (prioridad.toLowerCase()) {
      case 'alta':
      case 'urgente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TareaCard = ({ tarea }: { tarea: Tarea & { estadoNormalizado?: string } }) => {
    const estado = tarea.estadoNormalizado || normalizeEstado(tarea.estado);
    
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-all duration-200 group relative"
      >
        {/* Barra de color según prioridad */}
        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${
          tarea.prioridad?.toLowerCase() === 'alta' || tarea.prioridad?.toLowerCase() === 'urgente' 
            ? 'bg-red-500' 
            : tarea.prioridad?.toLowerCase() === 'media' 
            ? 'bg-yellow-500' 
            : 'bg-green-500'
        }`}></div>

        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 pr-2 flex-1">
            {tarea.titulo}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {hasPermission('tasks:complete') && estado !== 'done' && (
              <button 
                onClick={() => handleChangeEstado(tarea, estado === 'open' ? 'in_progress' : 'done')}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title={estado === 'open' ? 'Iniciar' : 'Completar'}
              >
                {estado === 'open' ? (
                  <PlayCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            )}
            {canCreateTasks() && (
              <button 
                onClick={() => handleEditTarea(tarea)}
                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                title="Editar"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
            {canDeleteTasks() && (
              <button 
                onClick={() => handleDeleteTarea(tarea.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Descripción */}
        {tarea.descripcion && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{tarea.descripcion}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tarea.prioridad && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(tarea.prioridad)}`}>
              {tarea.prioridad === 'urgente' ? 'Urgente' : 
               tarea.prioridad === 'alta' ? 'Alta' :
               tarea.prioridad === 'media' ? 'Media' : 'Baja'}
            </span>
          )}
          {tarea.tipo && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              {tarea.tipo}
            </span>
          )}
        </div>

        {/* Info adicional */}
        <div className="space-y-1.5 text-xs text-gray-500">
          {tarea.fecha_vencimiento && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(tarea.fecha_vencimiento)}</span>
            </div>
          )}
          {tarea.asignado_a && (
            <div className="flex items-center gap-1.5">
              <User className="h-3 w-3" />
              <span className="truncate">{tarea.asignado_a.nombre} {tarea.asignado_a.apellido}</span>
            </div>
          )}
          {tarea.caballo && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              <span className="truncate">{tarea.caballo.nombre}</span>
            </div>
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
    icon: Icon, 
    color, 
    tareas: columnTareas,
    estado,
    isMobile: isMobileProp
  }: { 
    title: string; 
    icon: any; 
    color: string;
    tareas: (Tarea & { estadoNormalizado?: string })[];
    estado: 'open' | 'in_progress' | 'done';
    isMobile: boolean;
  }) => {
    const isExpanded = expandedColumns.has(estado);

    return (
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header de columna */}
        <button
          onClick={() => isMobileProp && toggleColumn(estado)}
          className={`${color} rounded-t-lg px-4 py-3 border-b border-gray-200 w-full text-left transition-colors ${
            isMobileProp ? 'cursor-pointer hover:opacity-90 active:opacity-80' : 'cursor-default'
          }`}
          type="button"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
              <span className="bg-white/80 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {columnTareas.length}
              </span>
            </div>
            {isMobileProp && (
              <div className="flex items-center ml-2">
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </div>
            )}
          </div>
        </button>

        {/* Contenido de columna */}
        <div 
          className={`flex-1 bg-gray-50 p-4 rounded-b-lg overflow-y-auto transition-all duration-200 ${
            isMobileProp 
              ? isExpanded 
                ? 'min-h-[300px] max-h-[600px] block' 
                : 'hidden'
              : 'min-h-[400px] max-h-[calc(100vh-400px)]'
          }`}
        >
          {columnTareas.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No hay tareas</p>
            </div>
          ) : (
            columnTareas.map((tarea) => (
              <TareaCard key={tarea.id} tarea={tarea} />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Buscador + Acción */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por título, descripción o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* Vista Kanban */}
      <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto pb-4">
        <KanbanColumn
          title="Abiertas"
          icon={Clock}
          color="bg-amber-50"
          tareas={organizedTareas.open}
          estado="open"
          isMobile={isMobile}
        />
        <KanbanColumn
          title="En Progreso"
          icon={PlayCircle}
          color="bg-blue-50"
          tareas={organizedTareas.in_progress}
          estado="in_progress"
          isMobile={isMobile}
        />
        <KanbanColumn
          title="Completadas"
          icon={CheckCircle2}
          color="bg-green-50"
          tareas={organizedTareas.done}
          estado="done"
          isMobile={isMobile}
        />
      </div>
      
      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

