import ApiClient from './apiClient';
import { logger } from '@/lib/utils/logger';

export interface Caballo {
  id: number;
  nombre: string;
  sexo: 'macho' | 'hembra' | null;
  fecha_nacimiento: string | null;
  pelaje: string | null;
  raza: string | null;
  disciplina: 'polo' | 'equitacion' | 'turf' | null;
  microchip: string | null;
  foto_url: string | null;
  estado_global: 'activo' | 'inactivo' | 'vendido' | 'fallecido';
  padre_id: number | null;
  madre_id: number | null;
  creado_el: string;
  actualizado_el: string | null;
  
  // Asociaciones
  padre?: Caballo;
  madre?: Caballo;
  propiedades?: PropietarioCaballo[];
  asociaciones_establecimientos?: CaballoEstablecimiento[];
  
  _count?: {
    eventos: number;
    descendencia: number;
  };
}

export interface PropietarioCaballo {
  id: number;
  caballo_id: number;
  propietario_usuario_id: number;
  actual: boolean;
  porcentaje_tenencia: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  propietario?: {
    id: number;
    nombre: string;
    apellido: string;
    email?: string;
  };
}

export interface CaballoEstablecimiento {
  id: number;
  caballo_id: number;
  establecimiento_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  estado_asociacion: 'pending' | 'accepted' | 'rejected' | 'finished';
  establecimiento?: {
    id: number;
    nombre: string;
    direccion?: string;
  };
}

export interface CreateCaballoData {
  nombre: string;
  sexo?: 'macho' | 'hembra';
  fecha_nacimiento?: string;
  pelaje?: string;
  raza?: string;
  disciplina?: 'polo' | 'equitacion' | 'turf';
  microchip?: string;
  foto_url?: string;
  padre_id?: number;
  madre_id?: number;
  establecimiento_id?: number;
  propietario_usuario_id?: number;
  porcentaje_tenencia?: number;
}

export interface UpdateCaballoData extends Partial<CreateCaballoData> {
  estado_global?: 'activo' | 'inactivo' | 'vendido' | 'fallecido';
}

export interface CaballoFilters {
  page?: number;
  limit?: number;
  search?: string;
  establecimiento?: number;
  raza?: string;
  sexo?: string;
  estado?: string;
}

export const caballoService = {
  /**
   * Obtener todos los caballos con filtros
   */
  async getAll(filters: CaballoFilters = {}) {
    try {
      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
        ...(filters.search && { search: filters.search }),
        ...(typeof filters.establecimiento === 'number' && { establecimiento: String(filters.establecimiento) }),
        ...(filters.raza && { raza: filters.raza }),
        ...(filters.sexo && { sexo: filters.sexo }),
        ...(filters.estado && { estado: filters.estado })
      });
      
      return await ApiClient.makeRequest(`/caballos?${params}`, {
        method: 'GET',
      });
    } catch (error) {
  logger.error('Error fetching caballos:', error);
      return { data: { caballos: [], total: 0, totalPages: 1 } };
    }
  },

  /**
   * Obtener caballo por ID
   */
  async getById(id: number) {
    try {
      return await ApiClient.makeRequest(`/caballos/${id}`, {
        method: 'GET',
      });
    } catch (error) {
  logger.error('Error fetching caballo:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo caballo
   */
  async create(data: CreateCaballoData) {
    try {
      return await ApiClient.makeRequest('/caballos', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
  logger.error('Error creating caballo:', error);
      throw error;
    }
  },

  /**
   * Actualizar caballo
   */
  async update(id: number, data: UpdateCaballoData) {
    try {
      return await ApiClient.makeRequest(`/caballos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
  logger.error('Error updating caballo:', error);
      throw error;
    }
  },

  /**
   * Eliminar caballo
   */
  async delete(id: number) {
    try {
      return await ApiClient.makeRequest(`/caballos/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
  logger.error('Error deleting caballo:', error);
      throw error;
    }
  },

  /**
   * Buscar caballos por nombre
   */
  async search(query: string, page = 1, limit = 10) {
    return this.getAll({
      search: query,
      page,
      limit
    });
  },

  /**
   * Obtener caballos por establecimiento
   */
  async getByEstablecimiento(establecimientoId: number, page = 1, limit = 10) {
    return this.getAll({
      establecimiento: establecimientoId,
      page,
      limit
    });
  },

  /**
   * Obtener propietarios de un caballo
   */
  async getPropietarios(caballoId: number) {
    // TODO: Implementar endpoint específico si es necesario
    const caballo: any = await this.getById(caballoId);
    return caballo.data?.propiedades || [];
  },

  /**
   * Obtener estadísticas de un caballo
   */
  async getStats(caballoId: number) {
    // TODO: Implementar endpoint de estadísticas
    return {
      totalEventos: 0,
      descendencia: 0,
      ultimoEvento: null,
      edad: null
    };
  },

  /**
   * Obtener opciones para formularios
   */
  getFormOptions() {
    return {
      sexos: [
        { value: 'macho', label: 'Macho' },
        { value: 'hembra', label: 'Hembra' }
      ],
      disciplinas: [
        { value: 'polo', label: 'Polo' },
        { value: 'equitacion', label: 'Equitación' },
        { value: 'turf', label: 'Turf' }
      ],
      estados: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
        { value: 'vendido', label: 'Vendido' },
        { value: 'fallecido', label: 'Fallecido' }
      ],
      razas: [
        'Sangre Pura de Carrera',
        'Cuarto de Milla',
        'Criollo',
        'Polo Argentino',
        'Silla Francés',
        'Paint Horse',
        'Appaloosa',
        'Árabe',
        'Lusitano',
        'Andaluz',
        'Otro'
      ]
    };
  }
};

export default caballoService;