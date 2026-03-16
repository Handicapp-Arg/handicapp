"use client";

import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTareas, tareasKeys } from '@/lib/hooks';
import { tareaService, type Tarea } from '@/lib/services/taskService';
import { TareaForm } from './TareaForm';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { EmptyState } from '@/components/ui/empty-state';
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
  Sparkles,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TareaListProps {
  tareasProp?: Tarea[];
}

// Mapea estado/prioridad a clases del design system
function getStatusClasses(estado?: string) {
  switch (estado?.toLowerCase()) {
    case 'completada':  return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'en_progreso': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'pendiente':   return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'cancelada':   return 'bg-gray-100 text-gray-500 border border-gray-200';
    default:            return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}

function getPriorityClasses(prioridad?: string) {
  switch (prioridad?.toLowerCase()) {
    case 'alta':
    case 'critica': return 'bg-red-50 text-red-700 border border-red-200';
    case 'media':   return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'baja':    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
    default:        return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}


function getStatusLabel(estado?: string) {
  const map: Record<string, string> = {
    pendiente: 'Pendiente', en_progreso: 'En Progreso',
    completada: 'Completada', cancelada: 'Cancelada',
  };
  return estado ? (map[estado] ?? estado) : '-';
}

function getPriorityLabel(prioridad?: string) {
  const map: Record<string, string> = {
    critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
  };
  return prioridad ? (map[prioridad] ?? prioridad) : '';
}

export function TareaList({ tareasProp }: TareaListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState<Tarea | null>(null);
  const { canCreateTasks, canDeleteTasks, hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LIMIT = 10;

  // React Query — only used when tareasProp is not provided
  const { data: queryResult, isLoading: queryLoading } = useTareas(
    { page: currentPage, limit: LIMIT, search: debouncedSearch || undefined },
    { enabled: !tareasProp }
  );

  const tareas: Tarea[] = tareasProp ?? (Array.isArray(queryResult?.data) ? queryResult.data : []);
  const total = queryResult?.total ?? 0;
  const totalPages = tareasProp ? 1 : Math.ceil(total / LIMIT) || 1;
  const loading = !tareasProp && queryLoading;

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 400);
  };

  const invalidateTareas = () => queryClient.invalidateQueries({ queryKey: tareasKeys.lists() });

  const handleCreateTarea = () => { setSelectedTarea(null); setShowForm(true); };
  const handleEditTarea = (tarea: Tarea) => { setSelectedTarea(tarea); setShowForm(true); };

  const handleDeleteTarea = async (id: number) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm text-gray-700">¿Eliminar esta tarea?</span>
        <button
          className="px-3 py-1 bg-red-600 text-white text-xs rounded-md font-medium"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await tareaService.delete(id);
              invalidateTareas();
              toast.success('Tarea eliminada');
            } catch {
              toast.error('Error al eliminar la tarea');
            }
          }}
        >Eliminar</button>
        <button
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
          onClick={() => toast.dismiss(t.id)}
        >Cancelar</button>
      </span>
    ), { duration: 6000 });
  };

  const handleCompleteTask = async (tarea: Tarea) => {
    try {
      await tareaService.update(tarea.id, {
        titulo: tarea.titulo,
        descripcion: tarea.descripcion || 'Tarea completada',
        tipo: tarea.tipo as any,
        prioridad: tarea.prioridad as any,
        fecha_vencimiento: tarea.fecha_vencimiento || '',
        estado: 'completada' as any,
        caballo_id: tarea.caballo_id,
        asignado_a_usuario_id: tarea.asignado_a_usuario_id,
        establecimiento_id: tarea.establecimiento_id,
        tiempo_estimado_minutos: tarea.tiempo_estimado_minutos,
        ubicacion: tarea.ubicacion,
      });
      invalidateTareas();
      toast.success('Tarea completada');
    } catch {
      toast.error('Error al completar la tarea');
    }
  };

  const filteredTareas = tareasProp
    ? tareas
    : tareas; // server-side search via debouncedSearch

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading && tareas.length === 0) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-36 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  return (
    <div>
      {/* ─── Toolbar ─── */}
      {!tareasProp && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar tarea..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            />
          </div>
          {canCreateTasks() && (
            <button
              onClick={handleCreateTarea}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md text-sm font-medium whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </button>
          )}
        </div>
      )}

      {tareasProp && canCreateTasks() && (
        <div className="flex justify-end mb-5">
          <button
            onClick={handleCreateTarea}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Nueva Tarea
          </button>
        </div>
      )}

      {/* ─── Grid ─── */}
      {filteredTareas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay tareas"
          description={searchTerm ? 'Ninguna tarea coincide con tu búsqueda.' : 'Creá tu primera tarea para empezar.'}
          action={!searchTerm && canCreateTasks() ? { label: 'Crear tarea', onClick: handleCreateTarea } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTareas.map((tarea) => (
            <div
              key={tarea.id}
              className="bg-white border border-gray-200 rounded-md p-4 hover:bg-gray-50"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 flex-1">
                  {tarea.titulo}
                </h3>
                <div className="flex gap-1 flex-shrink-0">
                  {tarea.estado !== 'completada' && hasPermission('tasks:complete') && (
                    <button
                      onClick={() => handleCompleteTask(tarea)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Completar"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {canCreateTasks() && (
                    <button
                      onClick={() => handleEditTarea(tarea)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {canDeleteTasks() && (
                    <button
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusClasses(tarea.estado)}`}>
                  {getStatusLabel(tarea.estado)}
                </span>
                {tarea.prioridad && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityClasses(tarea.prioridad)}`}>
                    {getPriorityLabel(tarea.prioridad)}
                  </span>
                )}
              </div>

              {/* Description */}
              {tarea.descripcion && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{tarea.descripcion}</p>
              )}

              {/* Meta info */}
              <div className="space-y-1.5 text-xs text-gray-500">
                {tarea.tipo && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="capitalize">{tarea.tipo}</span>
                  </div>
                )}
                {tarea.fecha_vencimiento && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{formatDate(tarea.fecha_vencimiento)}</span>
                  </div>
                )}
                {tarea.asignado_a && (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{tarea.asignado_a.nombre} {tarea.asignado_a.apellido}</span>
                  </div>
                )}
                {tarea.caballo && (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{tarea.caballo.nombre}</span>
                  </div>
                )}
                {tarea.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{tarea.ubicacion}</span>
                  </div>
                )}
                {tarea.tiempo_estimado_minutos && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>{tarea.tiempo_estimado_minutos} min</span>
                  </div>
                )}
              </div>

              {/* Read-only indicator */}
              {!hasPermission('tasks:complete') && !canCreateTasks() && !canDeleteTasks() && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Solo lectura</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <TareaForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        tarea={selectedTarea || undefined}
        onSuccess={invalidateTareas}
      />
    </div>
  );
}
