import ApiClient from './apiClient';

export interface Evento {
  id: number;
  tipo_evento_id: number;
  caballo_id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  fecha_vencimiento?: string;
  hora_inicio?: string;
  hora_fin?: string;
  ubicacion?: string;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'vencido' | 'programado' | 'en_progreso' | 'reprogramado';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  es_publico?: boolean;
  requiere_validacion?: boolean;
  validado: boolean;
  estado_validacion?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  // Costo: el backend usa costo_monto y costo_moneda
  costo_monto?: number;
  costo_moneda?: string;
  adjuntos?: string[];
  origen_tarea_id?: number;
  creado_por_usuario_id: number;
  validado_por_usuario_id?: number;
  creado_el: string;
  actualizado_el: string;
  caballo?: { id: number; nombre: string };
  tipo_evento?: { id: number; nombre: string; categoria?: string };
  creado_por?: { id: number; nombre: string; apellido: string };
  validado_por?: { id: number; nombre: string; apellido: string };
  veterinario?: { nombre: string; apellido: string };
}

export interface CreateEventoData {
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  hora_inicio?: string;
  hora_fin?: string;
  tipo_evento_id: number;
  caballo_id?: number;
  establecimiento_id?: number;
  ubicacion?: string;
  estado?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  es_publico?: boolean;
  requiere_validacion?: boolean;
  // Backend espera costo_monto y costo_moneda (no "costo")
  costo_monto?: number;
  costo_moneda?: string;
}

export interface EventoFormData extends Omit<CreateEventoData, 'estado'> {
  hora_inicio?: string;
  hora_fin?: string;
  estado?: 'programado' | 'en_progreso' | 'completado' | 'cancelado' | 'reprogramado';
  es_publico?: boolean;
  requiere_validacion?: boolean;
}

export interface EventoFilters {
  search?: string;
  tipo_evento_id?: number;
  caballo_id?: number;
  estado?: string;
  prioridad?: string;
  validado?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class EventoService {
  private baseUrl = '/eventos';

  async getAll(filters: EventoFilters = {}): Promise<{ data: Evento[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    return ApiClient.makeRequest(`${this.baseUrl}?${params}`) as any;
  }

  async getById(id: number): Promise<Evento> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`) as any;
  }

  async create(data: CreateEventoData): Promise<Evento> {
    return ApiClient.makeRequest(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    }) as any;
  }

  async update(id: number, data: Partial<CreateEventoData>): Promise<Evento> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }) as any;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`, { method: 'DELETE' }) as any;
  }

  async getUpcoming(filters: Record<string, unknown> = {}): Promise<{ data: Evento[] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });
    return ApiClient.makeRequest(`${this.baseUrl}/programados?${params}`) as any;
  }

  async getOverdue(): Promise<{ data: Evento[] }> {
    return ApiClient.makeRequest(`${this.baseUrl}?vencidos=true`) as any;
  }

  // Ruta correcta: /historial-medico/caballo/:caballoId
  async getHistorialMedico(caballoId: number): Promise<{ data: Evento[] }> {
    return ApiClient.makeRequest(`${this.baseUrl}/historial-medico/caballo/${caballoId}`) as any;
  }

  async getTipos(): Promise<{ id: number; nombre: string; clave: string; disciplina?: string | null }[]> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/tipos`) as any;
    return response?.data ?? response ?? [];
  }
}

export const eventoService = new EventoService();
