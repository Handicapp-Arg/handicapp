import ApiClient from './apiClient';

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
}

export const caballoService = {
  /**
   * Obtener todos los caballos con filtros
   */
  async getAll(filters: CaballoFilters = {}) {
    return ApiClient.getCaballos(
      filters.page || 1,
      filters.limit || 10,
      filters
    );
  },

  /**
   * Obtener caballo por ID
   */
  async getById(id: number) {
    return ApiClient.getCaballoById(id);
  },

  /**
   * Crear nuevo caballo
   */
  async create(data: CreateCaballoData) {
    return ApiClient.createCaballo(data);
  },

  /**
   * Actualizar caballo
   */
  async update(id: number, data: UpdateCaballoData) {
    return ApiClient.updateCaballo(id, data);
  },

  /**
   * Eliminar caballo
   */
  async delete(id: number) {
    return ApiClient.deleteCaballo(id);
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