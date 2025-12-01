/**
 * useTasks Hook - Gestión centralizada de lógica de tareas
 * Siguiendo principios de Clean Architecture y Separation of Concerns
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { tareaService } from '@/lib/services/tareaService';
import { 
  Task, 
  TaskStatus, 
  TaskView, 
  TaskFilters, 
  TaskStats,
  normalizeTask
} from '@/types/task.types';
import toast from 'react-hot-toast';

interface UseTasksOptions {
  autoLoad?: boolean;
  filters?: TaskFilters;
}

interface UseTasksReturn {
  // Estado
  tasks: Task[];
  loading: boolean;
  error: string | null;
  stats: TaskStats;
  
  // Acciones
  loadTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
  updateTaskStatus: (id: number, status: TaskStatus) => Promise<Task | null>;
  
  // Filtros
  filterTasks: (filters: TaskFilters) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByView: (view: TaskView) => Task[];
  
  // Utilidades
  refreshTasks: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { autoLoad = true, filters: initialFilters } = options;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});

  // Calcular estadísticas
  const stats = useMemo<TaskStats>(() => {
    const total = tasks.length;
    const open = tasks.filter(t => t.estadoNormalizado === 'open').length;
    const inProgress = tasks.filter(t => t.estadoNormalizado === 'in_progress').length;
    const completed = tasks.filter(t => t.estadoNormalizado === 'completed').length;
    const cancelled = tasks.filter(t => t.estadoNormalizado === 'cancelled').length;

    return { total, open, inProgress, completed, cancelled };
  }, [tasks]);

  // Cargar tareas
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: any = await tareaService.getAll({ page: 1, limit: 500 });
      const tasksData = response?.data?.tareas || response?.tareas || response?.data || response || [];
      
      const normalizedTasks = Array.isArray(tasksData)
        ? tasksData.map(normalizeTask)
        : [];
      
      setTasks(normalizedTasks);
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al cargar tareas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear tarea
  const createTask = useCallback(async (taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const newTask = await tareaService.create(taskData as any);
      const normalized = normalizeTask(newTask);
      
      setTasks(prev => [...prev, normalized]);
      toast.success('Tarea creada exitosamente');
      
      return normalized;
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Error al crear tarea';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Actualizar tarea
  const updateTask = useCallback(async (id: number, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const updated = await tareaService.update(id, updates as any);
      const normalized = normalizeTask(updated);
      
      setTasks(prev => prev.map(t => t.id === id ? normalized : t));
      toast.success('Tarea actualizada exitosamente');
      
      return normalized;
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Error al actualizar tarea';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Eliminar tarea
  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      await tareaService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Tarea eliminada exitosamente');
      return true;
    } catch (err: any) {
      const errorMessage = err?.message || 'Error al eliminar tarea';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Actualizar solo el estado
  const updateTaskStatus = useCallback(async (id: number, status: TaskStatus): Promise<Task | null> => {
    return updateTask(id, { estadoNormalizado: status });
  }, [updateTask]);

  // Filtrar tareas
  const filterTasks = useCallback((filterOptions: TaskFilters): Task[] => {
    let filtered = [...tasks];

    if (filterOptions.search) {
      const search = filterOptions.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.titulo?.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search) ||
        t.tipo?.toLowerCase().includes(search)
      );
    }

    if (filterOptions.status && filterOptions.status !== 'all') {
      filtered = filtered.filter(t => t.estadoNormalizado === filterOptions.status);
    }

    if (filterOptions.priority) {
      filtered = filtered.filter(t => t.prioridad === filterOptions.priority);
    }

    if (filterOptions.assignedTo) {
      filtered = filtered.filter(t => t.asignado_a === filterOptions.assignedTo);
    }

    return filtered;
  }, [tasks]);

  // Obtener tareas por estado
  const getTasksByStatus = useCallback((status: TaskStatus): Task[] => {
    return tasks.filter(t => t.estadoNormalizado === status);
  }, [tasks]);

  // Obtener tareas por vista
  const getTasksByView = useCallback((view: TaskView): Task[] => {
    switch (view) {
      case 'all':
        return tasks;
      case 'open':
        return tasks.filter(t => t.estadoNormalizado === 'open');
      case 'in_progress':
        return tasks.filter(t => t.estadoNormalizado === 'in_progress');
      case 'completed':
        return tasks.filter(t => t.estadoNormalizado === 'completed');
      default:
        return tasks;
    }
  }, [tasks]);

  // Refrescar tareas
  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad) {
      loadTasks();
    }
  }, [autoLoad, loadTasks]);

  return {
    tasks,
    loading,
    error,
    stats,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    filterTasks,
    getTasksByStatus,
    getTasksByView,
    refreshTasks
  };
}
