/**
 * useTasks Hook - Gestión centralizada de lógica de tareas
 * Siguiendo principios de Clean Architecture y Separation of Concerns
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { tareaService, type Tarea } from '@/lib/services/tareaService';
import { 
  EstadoTarea, 
  VistaKanban, 
  FiltrosTarea, 
  EstadisticasTarea
} from '@/types/task.types';
import toast from 'react-hot-toast';

interface UseTasksOptions {
  autoLoad?: boolean;
  filters?: FiltrosTarea;
}

interface UseTasksReturn {
  // Estado
  tasks: Tarea[];
  loading: boolean;
  error: string | null;
  stats: EstadisticasTarea;
  
  // Acciones
  loadTasks: () => Promise<void>;
  createTask: (task: Partial<Tarea>) => Promise<Tarea | null>;
  updateTask: (id: number, updates: Partial<Tarea>) => Promise<Tarea | null>;
  deleteTask: (id: number) => Promise<boolean>;
  updateTaskStatus: (id: number, status: EstadoTarea) => Promise<Tarea | null>;
  
  // Filtros
  filterTasks: (filters: FiltrosTarea) => Tarea[];
  getTasksByStatus: (status: EstadoTarea) => Tarea[];
  getTasksByView: (view: VistaKanban) => Tarea[];
  
  // Utilidades
  refreshTasks: () => Promise<void>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { autoLoad = true } = options;
  
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular estadísticas
  const stats = useMemo<EstadisticasTarea>(() => {
    const total = tasks.length;
    const pendientes = tasks.filter(t => t.estado === 'pendiente').length;
    const en_progreso = tasks.filter(t => t.estado === 'en_progreso').length;
    const completadas = tasks.filter(t => t.estado === 'completada').length;
    const canceladas = tasks.filter(t => t.estado === 'cancelada').length;

    return { total, pendientes, en_progreso, completadas, canceladas };
  }, [tasks]);

  // El backend devuelve estados en español directamente

  // Cargar tareas
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tareaService.getAll({ page: 1, limit: 500 });
      const tareasData = response.data;
      
      // El backend ya devuelve los estados en español
      setTasks(tareasData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tareas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear tarea
  const createTask = useCallback(async (taskData: any): Promise<Tarea | null> => {
    try {
      const newTask = await tareaService.create(taskData as any);
      
      setTasks(prev => [...prev, newTask]);
      toast.success('Tarea creada exitosamente');
      
      return newTask;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tarea';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  // Actualizar tarea
  const updateTask = useCallback(async (id: number, updates: Partial<Tarea>): Promise<Tarea | null> => {
    try {
      const updated = await tareaService.update(id, updates);
      
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Tarea actualizada exitosamente');
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar tarea';
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tarea';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  // Actualizar solo el estado
  const updateTaskStatus = useCallback(async (id: number, status: EstadoTarea): Promise<Tarea | null> => {
    return updateTask(id, { estado: status });
  }, [updateTask]);

  // Filtrar tareas
  const filterTasks = useCallback((filterOptions: FiltrosTarea): Tarea[] => {
    let filtered = [...tasks];

    if (filterOptions.busqueda) {
      const search = filterOptions.busqueda.toLowerCase();
      filtered = filtered.filter(t => 
        t.titulo?.toLowerCase().includes(search) ||
        t.descripcion?.toLowerCase().includes(search) ||
        t.tipo?.toLowerCase().includes(search)
      );
    }

    if (filterOptions.estado && filterOptions.estado !== 'todas') {
      filtered = filtered.filter(t => t.estado === filterOptions.estado);
    }

    if (filterOptions.prioridad) {
      filtered = filtered.filter(t => t.prioridad === filterOptions.prioridad);
    }

    if (filterOptions.asignado_a) {
      filtered = filtered.filter(t => t.asignado_a === filterOptions.asignado_a);
    }

    return filtered;
  }, [tasks]);

  // Obtener tareas por estado
  const getTasksByStatus = useCallback((status: EstadoTarea): Tarea[] => {
    return tasks.filter(t => t.estado === status);
  }, [tasks]);

  // Obtener tareas por vista
  const getTasksByView = useCallback((view: VistaKanban): Tarea[] => {
    switch (view) {
      case 'todas':
        return tasks;
      case 'pendiente':
        return tasks.filter(t => t.estado === 'pendiente');
      case 'en_progreso':
        return tasks.filter(t => t.estado === 'en_progreso');
      case 'completada':
        return tasks.filter(t => t.estado === 'completada');
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
