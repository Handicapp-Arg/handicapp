/**
 * Task Types - Sistema de tipos centralizado para tareas
 * Siguiendo principios SOLID y DRY
 * Normalizado en español para consistencia con backend
 */

// Import y re-export de tipos desde tareaService para consistencia
import type { Tarea } from '@/lib/services/taskService';
export type { Tarea };

// Estado de tarea
export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'vencida';

// Prioridad de tarea
export type PrioridadTarea = 'baja' | 'media' | 'alta' | 'critica';

// Vista del Kanban
export type VistaKanban = 'todas' | 'pendiente' | 'en_progreso' | 'completada';

// Filtros de búsqueda
export interface FiltrosTarea {
  busqueda?: string;
  estado?: EstadoTarea | 'todas';
  prioridad?: PrioridadTarea;
  asignado_a?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Estadísticas de tareas
export interface EstadisticasTarea {
  total: number;
  pendientes: number;
  en_progreso: number;
  completadas: number;
  canceladas: number;
}

// Props para componentes de tareas
export interface TareaManagerProps {
  tareasIniciales?: Tarea[];
  alCrear?: (tarea: Tarea) => void;
  alActualizar?: (tarea: Tarea) => void;
  alEliminar?: (tareaId: number) => void;
  puedeCrear?: boolean;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
  compacto?: boolean;
}

// Labels para UI
export const ETIQUETAS_ESTADO: Record<EstadoTarea, string> = {
  'pendiente': 'Pendiente',
  'en_progreso': 'En Progreso',
  'completada': 'Completada',
  'cancelada': 'Cancelada',
  'vencida': 'Vencida'
};

export const ETIQUETAS_VISTA: Record<VistaKanban, string> = {
  'todas': 'Todas',
  'pendiente': 'Pendiente',
  'en_progreso': 'En Progreso',
  'completada': 'Completada'
};

export const ETIQUETAS_PRIORIDAD: Record<PrioridadTarea, string> = {
  'baja': 'Baja',
  'media': 'Media',
  'alta': 'Alta',
  'critica': 'Crítica'
};

// Colores para estados
export const COLORES_ESTADO: Record<EstadoTarea, {
  bg: string;
  text: string;
  border: string;
  icon: string;
}> = {
  'pendiente': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'text-blue-500'
  },
  'en_progreso': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'text-amber-500'
  },
  'completada': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'text-green-500'
  },
  'cancelada': {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    icon: 'text-gray-500'
  },
  'vencida': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'text-red-500'
  }
};
