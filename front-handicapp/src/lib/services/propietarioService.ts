// src/lib/services/propietarioService.ts
// -----------------------------------------------------------------------------
// HandicApp Frontend - Servicio de Propietarios de Caballos
// -----------------------------------------------------------------------------

export interface Propietario {
  id: number;
  caballo_id: number;
  propietario_usuario_id: number;
  actual: boolean;
  porcentaje_tenencia: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  creado_el: string;
  propietario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface UpdatePropietarioData {
  porcentaje_tenencia?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  actual?: boolean;
}

export interface AddPropietarioData {
  propietarioId: number;
  fechaInicio?: string;
  porcentaje?: number;
}

export class PropietarioService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
  }

  /**
   * Obtener propietarios actuales de un caballo
   */
  async getPropietarios(caballoId: number): Promise<Propietario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/caballos/${caballoId}/propietarios`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener propietarios');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en getPropietarios:', error);
      throw error;
    }
  }

  /**
   * Obtener historial completo de propietarios (actuales + históricos)
   */
  async getHistorial(caballoId: number): Promise<Propietario[]> {
    try {
      const response = await fetch(`${this.baseUrl}/caballos/${caballoId}/propietarios/historial`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener historial de propietarios');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error en getHistorial:', error);
      throw error;
    }
  }

  /**
   * Agregar nuevo propietario a un caballo
   */
  async addPropietario(caballoId: number, data: AddPropietarioData): Promise<Propietario> {
    try {
      const response = await fetch(`${this.baseUrl}/caballos/${caballoId}/propietarios`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al agregar propietario');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en addPropietario:', error);
      throw error;
    }
  }

  /**
   * Actualizar datos de propiedad
   */
  async updatePropietario(
    caballoId: number,
    propietarioId: number,
    data: UpdatePropietarioData
  ): Promise<Propietario> {
    try {
      const response = await fetch(
        `${this.baseUrl}/caballos/${caballoId}/propietarios/${propietarioId}`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar propietario');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en updatePropietario:', error);
      throw error;
    }
  }

  /**
   * Finalizar propiedad (marcar como histórico)
   */
  async removePropietario(
    caballoId: number,
    propietarioId: number,
    fechaFin?: string
  ): Promise<Propietario> {
    try {
      const response = await fetch(
        `${this.baseUrl}/caballos/${caballoId}/propietarios/${propietarioId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fecha_fin: fechaFin }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al finalizar propiedad');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en removePropietario:', error);
      throw error;
    }
  }
}

export const propietarioService = new PropietarioService();
