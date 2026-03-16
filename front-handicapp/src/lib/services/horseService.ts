import ApiClient from './apiClient';
import { logger } from '@/lib/utils/logger';
import { showError, showSuccess } from '@/lib/utils/errorHandler';

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
  
  // Documentación e identificación oficial
  rp: string | null; // Registro de Pedigree
  sba: string | null; // Stud Book Argentino
  adn: string | null; // Verificación genética
  pasaporte: string | null; // Pasaporte equino
  numero_fei: string | null; // Número FEI
  ueln: string | null; // Universal Equine Life Number
  
  // Datos físicos
  altura: number | null; // Altura en cm
  peso: number | null; // Peso en kg
  
  creado_el: string;
  actualizado_el: string | null;
  link_uuid?: string | null;
  observaciones?: string | null;
  abuelo_materno?: string | null;

  // Asociaciones opcionales (formato API expandido)
  Establecimiento?: { nombre?: string; localidad?: string; [key: string]: unknown } | null;
  Propietario?: { nombre?: string; apellido?: string; [key: string]: unknown } | null;

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
  solicitante_id?: number;
  aprobador_id?: number;
  fecha_solicitud?: string;
  fecha_respuesta?: string | null;
  caballo?: {
    id: number;
    nombre: string;
    raza?: string;
  };
  establecimiento?: {
    id: number;
    nombre: string;
    direccion?: string;
  };
  propietario?: {
    nombre: string;
    apellido: string;
  };
}

export interface CaballoPedigreeNode {
  id: number;
  nombre: string;
}

export interface CaballoPedigree {
  caballo: CaballoPedigreeNode;
  padre: CaballoPedigreeNode | null;
  madre: CaballoPedigreeNode | null;
  abueloPaterno: CaballoPedigreeNode | null;
  abuelaPaterna: CaballoPedigreeNode | null;
  abueloMaterno: CaballoPedigreeNode | null;
  abuelaMaterna: CaballoPedigreeNode | null;
}

export interface HistorialMedicoItem {
  id: number;
  fecha_evento: string;
  titulo: string | null;
  descripcion: string | null;
  tipo_evento?: { id: number; nombre: string; categoria?: string };
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
  
  // Documentación e identificación oficial
  rp?: string;
  sba?: string;
  adn?: string;
  pasaporte?: string;
  numero_fei?: string;
  ueln?: string;
  
  // Datos físicos
  altura?: number;
  peso?: number;
  
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

export interface CaballoStats {
  totalEventos: number;
  descendencia: number;
  ultimoEvento: { fecha: string; tipo: string } | null;
  edad: number | null;
}

export const caballoService = {
  /**
   * Obtener todos los caballos con filtros
   */
  async getAll(filters: CaballoFilters = {}) {
    try {
      const params: Record<string, string> = {
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 10).toString(),
      };

      if (filters.search) params.search = filters.search;
      if (typeof filters.establecimiento === 'number') params.establecimiento = String(filters.establecimiento);
      if (filters.raza) params.raza = filters.raza;
      if (filters.sexo) params.sexo = filters.sexo;
      if (filters.estado) params.estado = filters.estado;
      
      const queryString = new URLSearchParams(params).toString();
      
      return await ApiClient.makeRequest(`/caballos?${queryString}`, {
        method: 'GET',
      });
    } catch (error) {
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
      throw error;
    }
  },

  /**
   * Obtener pedigrí (padres y abuelos)
   */
  async getPedigree(id: number) {
    try {
      return await ApiClient.makeRequest(`/caballos/${id}/pedigree`, {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener historial médico del caballo
   */
  async getHistorialMedico(id: number) {
    try {
      return await ApiClient.makeRequest(`/caballos/${id}/historial-medico`, {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear nuevo caballo
   */
  async create(data: CreateCaballoData) {
    try {
      const result = await ApiClient.makeRequest('/caballos', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      showSuccess('caballo', 'created');
      return result;
    } catch (error) {
      showError(error, 'caballo', 'create_failed');
      throw error;
    }
  },

  /**
   * Actualizar caballo
   */
  async update(id: number, data: UpdateCaballoData) {
    try {
      const result = await ApiClient.makeRequest(`/caballos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      showSuccess('caballo', 'updated');
      return result;
    } catch (error) {
      showError(error, 'caballo', 'update_failed');
      throw error;
    }
  },

  /**
   * Eliminar caballo
   */
  async delete(id: number) {
    try {
      const result = await ApiClient.makeRequest(`/caballos/${id}`, {
        method: 'DELETE',
      });
      showSuccess('caballo', 'deleted');
      return result;
    } catch (error) {
      showError(error, 'caballo', 'delete_failed');
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
    try {
      return await ApiClient.makeRequest(`/caballos/${caballoId}/estadisticas`, {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  /** Obtener descendencia (hijos/hijas) */
  async getDescendencia(caballoId: number) {
    try {
      return await ApiClient.makeRequest(`/caballos/${caballoId}/descendencia`, {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  /** Obtener solicitudes pendientes de asociación para el usuario actual */
  async getSolicitudesPendientes(): Promise<CaballoEstablecimiento[]> {
    try {
      // Este endpoint debería filtrar las solicitudes según el rol del usuario
      const response = await ApiClient.makeRequest('/caballos/solicitudes-pendientes', {
        method: 'GET',
      });
      return (response as any).data || [];
    } catch (error) {
      console.error('Error fetching solicitudes pendientes:', error);
      throw error;
    }
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