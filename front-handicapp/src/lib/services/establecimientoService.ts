import { apiClient } from '@/lib/http';
import { showError, showSuccess, parseError } from '@/lib/utils/errorHandler';

export interface Establecimiento {
  id: number;
  nombre: string;
  cuit?: string;
  // Dirección estructurada
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  latitud?: number | null;
  longitud?: number | null;
  // Contacto
  telefono?: string;
  email?: string;
  // Detalles
  tipo_establecimiento?: 'haras' | 'polo' | 'salto' | 'doma' | 'turf' | 'enduro' | 'mixto' | 'otro';
  estado?: 'activo' | 'inactivo' | 'mantenimiento' | 'suspendido';
  superficie_hectareas?: number;
  cantidad_boxes?: number;
  cantidad_paddocks?: number;
  disciplina_principal?: string;
  descripcion?: string | null;
  // Media & Ratings
  imagenes?: string[];
  logo_url?: string | null;
  rating_promedio?: number;
  total_resenas?: number;
  verificado?: boolean;
  // Servicios
  servicios?: string[];
  servicios_disponibles?: string[];
  // Metadata
  creado_el: string;
  actualizado_el: string;
  propietario_id?: number;
  // Relaciones
  usuarios?: any[];
  caballos?: any[];
  // Campos para propietarios (backend los agrega)
  mis_caballos?: Array<{
    id: number;
    nombre: string;
    estado_global: string;
  }>;
  caballos_count?: number;
  _count?: {
    usuarios: number;
    caballos: number;
    eventos: number;
    tareas: number;
  };
}

export interface CreateEstablecimientoData {
  nombre: string;
  cuit?: string;
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  telefono?: string;
  email?: string;
  tipo_establecimiento?: string;
  estado?: string;
  superficie_hectareas?: number;
  cantidad_boxes?: number;
  servicios?: string[];
  disciplina_principal?: string;
  admin_email?: string;
  admin_password?: string;
  admin_nombre?: string;
  admin_apellido?: string;
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
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
      return response.data;
    } catch (error) {
      showError(error, 'establecimiento', 'fetch_list');
      throw error;
    }
  }

  async getById(id: number): Promise<Establecimiento> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
      return response.data;
    } catch (error) {
      showError(error, 'establecimiento', 'not_found');
      throw error;
    }
  }

  async create(data: CreateEstablecimientoData): Promise<Establecimiento> {
    try {
      const response = await apiClient.post(this.baseUrl, data) as any;
      showSuccess('establecimiento', 'created');
      return response.data;
    } catch (error) {
      showError(error, 'establecimiento', 'create_failed');
      throw error;
    }
  }

  async update(id: number, data: Partial<CreateEstablecimientoData>): Promise<Establecimiento> {
    try {
      const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
      showSuccess('establecimiento', 'updated');
      return response.data;
    } catch (error) {
      showError(error, 'establecimiento', 'update_failed');
      throw error;
    }
  }

  async delete(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
      showSuccess('establecimiento', 'deleted');
      return response.data;
    } catch (error) {
      showError(error, 'establecimiento', 'delete_failed');
      throw error;
    }
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

  // ============================================================================
  // NUEVOS MÉTODOS: Geolocalización, Reseñas e Imágenes
  // ============================================================================

  async getForMap(filters?: { tipo?: string; rating_minimo?: number; verificado?: boolean }): Promise<Establecimiento[]> {
    const params = new URLSearchParams();
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.rating_minimo) params.append('rating_minimo', filters.rating_minimo.toString());
    if (filters?.verificado !== undefined) params.append('verificado', filters.verificado.toString());

    const url = `${this.baseUrl}/mapa${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url) as any;
    return response.data || response;
  }

  async createResena(establecimientoId: number, data: { rating: number; comentario?: string }): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/resenas`, data) as any;
    return response.data;
  }

  async getResenas(establecimientoId: number, options?: { page?: number; limit?: number; rating?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.rating) params.append('rating', options.rating.toString());

    const url = `${this.baseUrl}/${establecimientoId}/resenas${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url) as any;
    return response.data || response;
  }

  async responderResena(establecimientoId: number, resenaId: number, respuesta: string): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${establecimientoId}/resenas/${resenaId}/responder`, {
      respuesta
    }) as any;
    return response.data;
  }
}

export const establecimientoService = new EstablecimientoService();
