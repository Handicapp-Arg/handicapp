import { apiClient } from '@/lib/http';

export interface Caballo {
  id: number;
  nombre: string;
  fecha_nacimiento: string;
  sexo: 'macho' | 'hembra';
  raza: string;
  color: string;
  altura?: number;
  peso?: number;
  disciplina_principal: 'polo' | 'salto' | 'doma' | 'turf' | 'endurance' | 'western' | 'recreation';
  nivel_entrenamiento: 'potro' | 'iniciacion' | 'intermedio' | 'avanzado' | 'competicion' | 'retirado';
  estado_salud: 'excelente' | 'bueno' | 'regular' | 'lesionado' | 'enfermo' | 'recuperacion';
  estado_reproduccion?: 'apto' | 'no_apto' | 'gestante' | 'lactante' | 'retirado_reproduccion';
  numero_microchip?: string;
  numero_pasaporte?: string;
  padre_id?: number;
  madre_id?: number;
  observaciones?: string;
  foto_url?: string;
  creado_el: string;
  actualizado_el: string;
  padre?: Caballo;
  madre?: Caballo;
  propietarios?: any[];
  establecimientos?: any[];
  eventos?: any[];
  _count?: {
    eventos: number;
    tareas: number;
    hijos: number;
  };
}

export interface CreateCaballoData {
  nombre: string;
  fecha_nacimiento: string;
  sexo: 'macho' | 'hembra';
  raza: string;
  color: string;
  altura?: number;
  peso?: number;
  disciplina_principal: 'polo' | 'salto' | 'doma' | 'turf' | 'endurance' | 'western' | 'recreation';
  nivel_entrenamiento: 'potro' | 'iniciacion' | 'intermedio' | 'avanzado' | 'competicion' | 'retirado';
  estado_salud: 'excelente' | 'bueno' | 'regular' | 'lesionado' | 'enfermo' | 'recuperacion';
  estado_reproduccion?: 'apto' | 'no_apto' | 'gestante' | 'lactante' | 'retirado_reproduccion';
  numero_microchip?: string;
  numero_pasaporte?: string;
  padre_id?: number;
  madre_id?: number;
  observaciones?: string;
  foto_url?: string;
}

export interface CaballoFilters {
  search?: string;
  sexo?: string;
  raza?: string;
  disciplina_principal?: string;
  nivel_entrenamiento?: string;
  estado_salud?: string;
  establecimiento_id?: number;
  propietario_id?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

class CaballoService {
  private baseUrl = '/caballos';

  async getAll(filters: CaballoFilters = {}): Promise<{ data: Caballo[], total: number, page: number, limit: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`${this.baseUrl}?${params}`) as any;
    return response.data;
  }

  async getById(id: number): Promise<Caballo> {
    const response = await apiClient.get(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async create(data: CreateCaballoData): Promise<Caballo> {
    const response = await apiClient.post(this.baseUrl, data) as any;
    return response.data;
  }

  async update(id: number, data: Partial<CreateCaballoData>): Promise<Caballo> {
    const response = await apiClient.put(`${this.baseUrl}/${id}`, data) as any;
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${id}`) as any;
    return response.data;
  }

  async getGenealogia(id: number): Promise<any> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/genealogia`) as any;
    return response.data;
  }

  async getHistorialMedico(id: number): Promise<any[]> {
    const response = await apiClient.get(`${this.baseUrl}/${id}/historial-medico`) as any;
    return response.data;
  }

  async addPropietario(caballoId: number, propietarioId: number, porcentaje: number): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${caballoId}/propietarios`, {
      propietario_usuario_id: propietarioId,
      porcentaje_propiedad: porcentaje
    }) as any;
    return response.data;
  }

  async removePropietario(caballoId: number, propietarioId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${caballoId}/propietarios/${propietarioId}`) as any;
    return response.data;
  }

  async addEstablecimiento(caballoId: number, establecimientoId: number): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}/${caballoId}/establecimientos`, {
      establecimiento_id: establecimientoId
    }) as any;
    return response.data;
  }

  async removeEstablecimiento(caballoId: number, establecimientoId: number): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`${this.baseUrl}/${caballoId}/establecimientos/${establecimientoId}`) as any;
    return response.data;
  }
}

export const caballoService = new CaballoService();