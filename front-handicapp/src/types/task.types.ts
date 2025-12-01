/**
 * Task Types - Sistema de tipos centralizado para tareas
 * Siguiendo principios SOLID y DRY
 */

// Estado de tarea normalizado para UI
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

// Estado de tarea del backend
export type TaskBackendStatus = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

// Prioridad de tarea
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Vista del Kanban
export type TaskView = 'all' | 'open' | 'in_progress' | 'completed';

// Interfaz principal de tarea
export interface Task {
  id: number;
  titulo: string;
  descripcion?: string;
  estado: TaskBackendStatus;
  estadoNormalizado?: TaskStatus; // Campo calculado para UI
  prioridad?: TaskPriority;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
  notas?: string;
  asignado_a?: number;
  creado_por?: number;
  establecimiento_id?: number;
  caballo_id?: number;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  caballo?: {
    id: number;
    nombre: string;
  };
  created_at?: string;
  updated_at?: string;
}

// Filtros de búsqueda
export interface TaskFilters {
  search?: string;
  status?: TaskStatus | 'all';
  priority?: TaskPriority;
  assignedTo?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Estadísticas de tareas
export interface TaskStats {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

// Props para componentes
export interface TaskManagerProps {
  initialTasks?: Task[];
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: number) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  compact?: boolean;
}

// Mapeo de estados
export const TASK_STATUS_MAP: Record<TaskBackendStatus, TaskStatus> = {
  'pendiente': 'open',
  'en_progreso': 'in_progress',
  'completada': 'completed',
  'cancelada': 'cancelled'
};

export const TASK_STATUS_REVERSE_MAP: Record<TaskStatus, TaskBackendStatus> = {
  'open': 'pendiente',
  'in_progress': 'en_progreso',
  'completed': 'completada',
  'cancelled': 'cancelada'
};

// Labels para UI
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'open': 'Abiertas',
  'in_progress': 'En Progreso',
  'completed': 'Completadas',
  'cancelled': 'Canceladas'
};

export const TASK_VIEW_LABELS: Record<TaskView, string> = {
  'all': 'Todas',
  'open': 'Abiertas',
  'in_progress': 'En Progreso',
  'completed': 'Completadas'
};

// Colores para estados
export const TASK_STATUS_COLORS: Record<TaskStatus, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  'open': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500'
  },
  'in_progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'text-amber-500'
  },
  'completed': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-500'
  },
  'cancelled': {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: 'text-gray-500'
  }
};

// Utilidades
export function normalizeTaskStatus(status: string | undefined): TaskStatus {
  if (!status) return 'open';
  const normalized = status.toLowerCase() as TaskBackendStatus;
  return TASK_STATUS_MAP[normalized] || 'open';
}

export function denormalizeTaskStatus(status: TaskStatus): TaskBackendStatus {
  return TASK_STATUS_REVERSE_MAP[status];
}

export function normalizeTask(task: any): Task {
  return {
    ...task,
    estadoNormalizado: normalizeTaskStatus(task.estado)
  };
}
