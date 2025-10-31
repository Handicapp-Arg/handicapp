import { apiClient } from '@/lib/http';

export interface Establecimiento {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  tipo_establecimiento: 'haras' | 'polo' | 'salto' | 'doma' | 'turf' | 'mixto';
  superficie_hectareas?: number;
  cantidad_boxes?: number;
  cantidad_paddocks?: number;
  servicios_disponibles?: string[];
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  creado_el: string;
  actualizado_el: string;
  propietario_id: number;
  usuarios?: any[];
  caballos?: any[];
  _count?: {
    usuarios: number;
    caballos: number;
    eventos: number;
    tareas: number;
  };
}

export interface CreateEstablecimientoData {
  nombre: string;
  cuit: string;
  direccion_calle?: string;
  telefono?: string;
  email?: string;
}

export interface EstablecimientoFilters {
  search?: string;
  tipo_establecimiento?: string;
  estado?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class EstablecimientoService {
  private baseUrl = '/establecimientos';

  async getAll(filters: EstablecimientoFilters = {}): Promise<{ data: Establecimiento[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
    return response.data;
  }

  async getById(id: number): Promise<Establecimiento> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async create(data: CreateEstablecimientoData): Promise<Establecimiento> {
    const response = await apiClient.post(this.baseUrl, data) as any;
    return response.data;
  }

  async update(id: number, data: Partial<CreateEstablecimientoData>): Promise<Establecimiento> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async getUsuarios(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/usuarios`) as any;
    return response.data;
  }

  async getCaballos(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/caballos`) as any;
    return response.data;
  }

  async getStats(id: number): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/stats`) as any;
    return response.data;
  }

  async addUsuario(establecimientoId: number, usuarioId: number, rol: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/usuarios`, {
      usuario_id: usuarioId,
      rol
    }) as any;
    return response.data;
  }

  async removeUsuario(establecimientoId: number, usuarioId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${establecimientoId}/usuarios/${usuarioId}`) as any;
    return response.data;
  }

  async asociarCaballo(establecimientoId: number, caballoId: number): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/caballos`, {
      caballo_id: caballoId
    }) as any;
    return response.data;
  }

  // Flujo bidireccional de asociaciones
  async solicitarCaballo(establecimientoId: number, caballoId: number): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/solicitar-caballo`, {
      caballo_id: caballoId
    }) as any;
    return response.data;
  }

  async aprobarAsociacion(establecimientoId: number, caballoId: number): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/caballos/${caballoId}/aprobar`) as any;
    return response.data;
  }

  async rechazarAsociacion(establecimientoId: number, caballoId: number, motivo?: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/caballos/${caballoId}/rechazar`, {
      motivo
    }) as any;
    return response.data;
  }
}

export const establecimientoService = new EstablecimientoService();