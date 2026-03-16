import ApiClient from './apiClient';

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
  estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' | 'vencida';
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

  // Mapear respuesta del backend (notas -> descripcion)
  private mapBackendTarea(tarea: any): Tarea {
    return {
      ...tarea,
      descripcion: tarea.notas || tarea.descripcion,
    };
  }

  async getAll(filters: TareaFilters = {}): Promise<{ data: Tarea[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();

    const mappings: Record<string, string> = {
      'fecha_desde': 'fechaInicio',
      'fecha_hasta': 'fechaFin',
      'tipo': 'categoria',
      'asignado_a_usuario_id': 'asignado',
      'caballo_id': 'caballo',
      'establecimiento_id': 'establecimiento',
      'creado_por_usuario_id': 'creadoPor',
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        const paramName = mappings[key] || key;
        params.append(paramName, value.toString());
      }
    });

    const response = await ApiClient.makeRequest(`${this.baseUrl}?${params}`) as any;
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map((tarea: any) => this.mapBackendTarea(tarea));
    }
    return response;
  }

  async getById(id: number): Promise<Tarea> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`) as any;
    const tarea = response?.data ?? response;
    return this.mapBackendTarea(tarea);
  }

  async create(data: CreateTareaData): Promise<Tarea> {
    const backendData = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      prioridad: data.prioridad,
      estado: data.estado,
      fechaVencimiento: data.fecha_vencimiento,
      tiempoEstimadoMinutos: data.tiempo_estimado_minutos,
      ubicacion: data.ubicacion,
      caballoId: data.caballo_id,
      establecimientoId: data.establecimiento_id,
      asignadoAUsuarioId: data.asignado_a_usuario_id,
    };

    const response = await ApiClient.makeRequest(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(backendData),
    }) as any;
    return this.mapBackendTarea(response);
  }

  async update(id: number, data: Partial<CreateTareaData>): Promise<Tarea> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }) as any;
    return this.mapBackendTarea(response);
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`, { method: 'DELETE' }) as any;
  }

  async changeEstado(id: number, nuevoEstado: string): Promise<Tarea> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}/estado`, {
      method: 'PUT',
      body: JSON.stringify({ nuevoEstado }),
    }) as any;
    return this.mapBackendTarea(response);
  }

  // PUT /tareas/:id/asignar — método y nombre correctos según backend
  async assign(id: number, usuarioId: number): Promise<Tarea> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}/asignar`, {
      method: 'PUT',
      body: JSON.stringify({ asignadoAUsuarioId: usuarioId }),
    }) as any;
    return this.mapBackendTarea(response);
  }

  // POST /tareas/:id/completar
  // Backend espera: { observacionesComplecion, tiempoRealMinutos }
  async complete(id: number, observaciones?: string, tiempoRealMinutos?: number): Promise<Tarea> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}/completar`, {
      method: 'POST',
      body: JSON.stringify({
        observacionesComplecion: observaciones,
        tiempoRealMinutos: tiempoRealMinutos,
      }),
    }) as any;
    return this.mapBackendTarea(response);
  }

  // Cancelar usa cambio de estado — no hay endpoint /cancel en el backend
  async cancel(id: number): Promise<Tarea> {
    return this.changeEstado(id, 'cancelada');
  }

  async crearEvento(id: number, datosAdicionales?: {
    costo_monto?: string;
    costo_moneda?: string;
    hora_inicio?: string;
    hora_fin?: string;
    ubicacion?: string;
    resultado?: string;
  }): Promise<any> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}/crear-evento`, {
      method: 'POST',
      body: JSON.stringify(datosAdicionales || {}),
    }) as any;
  }
}

export const tareaService = new TareaService();
