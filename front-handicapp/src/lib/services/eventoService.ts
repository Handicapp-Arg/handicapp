import { apiClient } from '@/lib/http';

export interface Evento {
  id: number;
  tipo_evento_id: number;
  caballo_id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
  observaciones?: string;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'vencido';
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  validado: boolean;
  costo?: number;
  adjuntos?: string[];
  creado_por_usuario_id: number;
  validado_por_usuario_id?: number;
  creado_el: string;
  actualizado_el: string;
  caballo?: any;
  tipo_evento?: any;
  creado_por?: any;
  validado_por?: any;
}

export interface CreateEventoData {
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  tipo_evento_id: number;
  caballo_id?: number;
  establecimiento_id?: number;
  ubicacion?: string;
  observaciones?: string;
  prioridad: 'baja' | 'media' | 'alta' | 'critica';
  costo?: number;
}

// Interfaz extendida para el formulario frontend
export interface EventoFormData extends CreateEventoData {
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

    const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
    return response.data;
  }

  async getById(id: number): Promise<Evento> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async create(data: CreateEventoData): Promise<Evento> {
    const response = await apiClient.post(this.baseUrl, data) as any;
    return response.data;
  }

  async update(id: number, data: Partial<CreateEventoData>): Promise<Evento> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async validate(id: number): Promise<Evento> {
    const response = await apiClient.patch(`${this.baseUrl}/${id}/validate`) as any;
    return response.data;
  }

  async getReportes(filters: any = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/reportes?${params}`) as any;
    return response.data;
  }

  async getUpcoming(filters: any = {}): Promise<{ data: Evento[] }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}/upcoming?${params}`) as any;
    return response.data;
  }

  async getOverdue(): Promise<{ data: Evento[] }> {
    const response = await apiClient.get(`${this.baseUrl}/overdue`) as any;
    return response.data;
  }

  async getHistorialMedico(caballoId: number): Promise<{ data: Evento[] }> {
    const response = await apiClient.get(`${this.baseUrl}/historial-medico/${caballoId}`) as any;
    return response.data;
  }
}

export const eventoService = new EventoService();