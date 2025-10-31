/**
 * Servicio para gestión de tratamientos médicos veterinarios
 */

import ApiClient from './apiClient';

export interface Tratamiento {
  id: number;
  caballo_id: number;
  caballo?: {
    id: number;
    nombre: string;
    raza?: string;
    edad?: number;
  };
  tipo: string;
  titulo: string;
  descripcion: string;
  medicamentos?: string;
  dosis?: string;
  frecuencia?: string;
  duracion_dias?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'activo' | 'completado' | 'suspendido';
  veterinario_id: number;
  observaciones?: string;
  creado_el: string;
  actualizado_el?: string;
}

export interface TratamientoForm {
  caballo_id: number;
  tipo: string;
  titulo: string;
  descripcion: string;
  medicamentos?: string;
  dosis?: string;
  frecuencia?: string;
  duracion_dias?: number;
  fecha_inicio: string;
  fecha_fin?: string;
  observaciones?: string;
}

class TratamientoService {
  private readonly basePath = '/tareas'; // Los tratamientos se manejan como tareas especiales

  /**
   * Obtener tratamientos activos
   */
  async getTratamientosActivos(): Promise<Tratamiento[]> {
    const params = new URLSearchParams({
      estado: 'en_progreso',
      tipo: 'tratamiento_medico'
    }).toString();
    const response = await ApiClient.makeRequest<{ data: Tratamiento[] }>(`/tareas?${params}`, { method: 'GET' });
    return response.data;
  }

  /**
   * Obtener tratamiento por ID
   */
  async getTratamiento(id: number): Promise<Tratamiento> {
    const response = await ApiClient.makeRequest<{ data: Tratamiento }>(`/tareas/${id}`, { method: 'GET' });
    return response.data;
  }

  /**
   * Obtener tratamientos por caballo
   */
  async getTratamientosByCaballo(caballoId: number): Promise<Tratamiento[]> {
    const params = new URLSearchParams({
      caballo_id: String(caballoId),
      tipo: 'tratamiento_medico'
    }).toString();
    const response = await ApiClient.makeRequest<{ data: Tratamiento[] }>(`/tareas?${params}`, { method: 'GET' });
    return response.data;
  }

  /**
   * Crear nuevo tratamiento
   */
  async crearTratamiento(data: TratamientoForm): Promise<Tratamiento> {
    const response = await ApiClient.makeRequest<{ data: Tratamiento }>('/tareas', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        tipo: 'tratamiento_medico',
        estado: 'en_progreso'
      })
    });
    return response.data;
  }

  /**
   * Actualizar tratamiento
   */
  async actualizarTratamiento(id: number, data: Partial<TratamientoForm>): Promise<Tratamiento> {
    const response = await ApiClient.makeRequest<{ data: Tratamiento }>(`/tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  }

  /**
   * Completar tratamiento
   */
  async completarTratamiento(id: number, observaciones?: string): Promise<Tratamiento> {
    const response = await ApiClient.makeRequest<{ data: Tratamiento }>(`/tareas/${id}/completar`, {
      method: 'PATCH',
      body: JSON.stringify({ observaciones })
    });
    return response.data;
  }

  /**
   * Suspender tratamiento
   */
  async suspenderTratamiento(id: number, motivo: string): Promise<Tratamiento> {
    const response = await ApiClient.makeRequest<{ data: Tratamiento }>(`/tareas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        estado: 'suspendido',
        observaciones: motivo
      })
    });
    return response.data;
  }

  /**
   * Eliminar tratamiento
   */
  async eliminarTratamiento(id: number): Promise<void> {
    await ApiClient.makeRequest(`/tareas/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Obtener estadísticas de tratamientos
   */
  async getEstadisticas(): Promise<{
    activos: number;
    completados: number;
    suspendidos: number;
    total: number;
  }> {
    try {
      const params = new URLSearchParams({ tipo: 'tratamiento_medico' }).toString();
      const todos = await ApiClient.makeRequest<{ data: Tratamiento[] }>(`/tareas?${params}`, { method: 'GET' });

      const tratamientos = todos.data;
      return {
        activos: tratamientos.filter(t => t.estado === 'activo').length,
        completados: tratamientos.filter(t => t.estado === 'completado').length,
        suspendidos: tratamientos.filter(t => t.estado === 'suspendido').length,
        total: tratamientos.length
      };
    } catch {
      return { activos: 0, completados: 0, suspendidos: 0, total: 0 };
    }
  }
}

export const tratamientoService = new TratamientoService();
export default tratamientoService;
