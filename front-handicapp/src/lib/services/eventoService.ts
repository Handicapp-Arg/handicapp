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
  costo?: number;
  adjuntos?: string[];
  creado_por_usuario_id: number;
  validado_por_usuario_id?: number;
  creado_el: string;
  actualizado_el: string;
  caballo?: {
    id: number;
    nombre: string;
  };
  tipo_evento?: {
    id: number;
    nombre: string;
    categoria?: string;
  };
  creado_por?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  validado_por?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  veterinario?: {
    nombre: string;
    apellido: string;
  };
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
  costo?: number;
}

// Interfaz extendida para el formulario frontend
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

    const response = await ApiClient.makeRequest(`${this.baseUrl}?${params}`);
    return response as { data: Evento[], total: number, page: number, limit: number };
  }

  async getById(id: number): Promise<Evento> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`);
    return response as Evento;
  }

  async create(data: CreateEventoData): Promise<Evento> {
    const response = await ApiClient.makeRequest(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response as Evento;
  }

  async update(id: number, data: Partial<CreateEventoData>): Promise<Evento> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response as Evento;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });
    return response as { success: boolean };
  }

  async validate(id: number): Promise<Evento> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}/validate`, {
      method: 'PATCH'
    });
    return response as Evento;
  }

  async getReportes(filters: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await ApiClient.makeRequest(`${this.baseUrl}/reportes?${params}`);
    return response as Record<string, unknown>;
  }

  async getUpcoming(filters: Record<string, unknown> = {}): Promise<{ data: Evento[] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await ApiClient.makeRequest(`${this.baseUrl}/programados?${params}`);
    return response as { data: Evento[] };
  }

  async getOverdue(): Promise<{ data: Evento[] }> {
    // Usar el endpoint general con filtros para eventos vencidos
    const response = await ApiClient.makeRequest(`${this.baseUrl}?vencidos=true`);
    return response as { data: Evento[] };
  }

  async getHistorialMedico(caballoId: number): Promise<{ data: Evento[] }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/historial-medico/${caballoId}`);
    return response as { data: Evento[] };
  }
}

export const eventoService = new EventoService();