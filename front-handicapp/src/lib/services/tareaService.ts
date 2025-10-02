import { apiClient } from '@/lib/http';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: 'alimentacion' | 'limpieza' | 'entrenamiento' | 'mantenimiento' | 'veterinaria' | 'administrativa' | 'otro';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'vencida';
  fecha_vencimiento?: string;
  tiempo_estimado_minutos?: number;
  tiempo_real_minutos?: number;
  ubicacion?: string;
  observaciones_completado?: string;
  caballo_id?: number;
  establecimiento_id?: number;
  creado_por_usuario_id: number;
  asignado_a_usuario_id?: number;
  completado_por_usuario_id?: number;
  fecha_completado?: string;
  creado_el: string;
  actualizado_el: string;
  caballo?: any;
  establecimiento?: any;
  creado_por?: any;
  asignado_a?: any;
  completado_por?: any;
}

export interface CreateTareaData {
  titulo: string;
  descripcion?: string;
  tipo: 'alimentacion' | 'limpieza' | 'entrenamiento' | 'mantenimiento' | 'veterinaria' | 'administrativa' | 'otro';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  fecha_vencimiento?: string;
  tiempo_estimado_minutos?: number;
  ubicacion?: string;
  caballo_id?: number;
  establecimiento_id?: number;
  asignado_a_usuario_id?: number;
}

export interface TareaFilters {
  search?: string;
  tipo?: string;
  estado?: string;
  prioridad?: string;
  caballo_id?: number;
  establecimiento_id?: number;
  asignado_a_usuario_id?: number;
  creado_por_usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class TareaService {
  private baseUrl = '/tareas';

  async getAll(filters: TareaFilters = {}): Promise<{ data: Tarea[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
    return response.data;
  }

  async getById(id: number): Promise<Tarea> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async create(data: CreateTareaData): Promise<Tarea> {
    const response = await apiClient.post(this.baseUrl, data) as any;
    return response.data;
  }

  async update(id: number, data: Partial<CreateTareaData>): Promise<Tarea> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async assign(id: number, usuarioId: number): Promise<Tarea> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/assign`, {
      asignado_a_usuario_id: usuarioId
    }) as any;
    return response.data;
  }

  async complete(id: number, observaciones?: string, tiempoRealMinutos?: number): Promise<Tarea> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/complete`, {
      observaciones_completado: observaciones,
      tiempo_real_minutos: tiempoRealMinutos
    }) as any;
    return response.data;
  }

  async cancel(id: number, motivo?: string): Promise<Tarea> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/cancel`, {
      motivo
    }) as any;
    return response.data;
  }

  async getStats(filters: any = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/stats?${params}`) as any;
    return response.data;
  }

  async getOverdue(): Promise<{ data: Tarea[] }> {
    const response = await apiClient.get(`${this.baseUrl}/overdue`) as any;
    return response.data;
  }

  async getByUser(usuarioId: number, filters: any = {}): Promise<{ data: Tarea[] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/user/${usuarioId}?${params}`) as any;
    return response.data;
  }

  async getProductivity(filters: any = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/productivity?${params}`) as any;
    return response.data;
  }
}

export const tareaService = new TareaService();