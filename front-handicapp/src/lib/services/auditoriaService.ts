import ApiClient from './apiClient';

export interface AuditoriaLog {
  id: number;
  actor_usuario_id: number;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  metadatos_json: string | null;
  ip: string | null;
  user_agent: string | null;
  creado_el: string;
  actor_usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
}

export interface AuditoriaStats {
  total: number;
  last24h: number;
  last7days: number;
  last30days: number;
  topActions: Array<{ accion: string; count: number }>;
  topUsers: Array<{
    actor_usuario_id: number;
    count: number;
    actor_usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  }>;
  entityTypes: Array<{ entidad_tipo: string; count: number }>;
}

export interface AuditoriaFilters {
  page?: number;
  limit?: number;
  accion?: string;
  entidad_tipo?: string;
  actor_usuario_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  search?: string;
}

class AuditoriaService {
  private readonly baseUrl = '/auditoria';

  /**
   * Get audit logs with filters
   */
  async getAuditorias(filters: AuditoriaFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.accion) params.append('accion', filters.accion);
      if (filters.entidad_tipo) params.append('entidad_tipo', filters.entidad_tipo);
      if (filters.actor_usuario_id) params.append('actor_usuario_id', filters.actor_usuario_id.toString());
      if (filters.fecha_inicio) params.append('fecha_inicio', filters.fecha_inicio);
      if (filters.fecha_fin) params.append('fecha_fin', filters.fecha_fin);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response: any = await ApiClient.makeRequest(url, {
        method: 'GET'
      });

      return {
        auditorias: response.data.auditorias as AuditoriaLog[],
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Error fetching auditorias:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getStats(): Promise<AuditoriaStats> {
    try {
      const response: any = await ApiClient.makeRequest(`${this.baseUrl}/stats`, {
        method: 'GET'
      });

      return response.data as AuditoriaStats;
    } catch (error: any) {
      console.error('Error fetching auditoria stats:', error);
      throw error;
    }
  }

  /**
   * Get audit log by ID
   */
  async getAuditoriaById(id: number): Promise<AuditoriaLog> {
    try {
      const response: any = await ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
        method: 'GET'
      });

      return response.data as AuditoriaLog;
    } catch (error: any) {
      console.error('Error fetching auditoria:', error);
      throw error;
    }
  }

  /**
   * Get unique actions for filters
   */
  async getActions(): Promise<string[]> {
    try {
      const response: any = await ApiClient.makeRequest(`${this.baseUrl}/actions`, {
        method: 'GET'
      });

      return response.data as string[];
    } catch (error: any) {
      console.error('Error fetching actions:', error);
      throw error;
    }
  }

  /**
   * Get unique entity types for filters
   */
  async getEntityTypes(): Promise<string[]> {
    try {
      const response: any = await ApiClient.makeRequest(`${this.baseUrl}/entity-types`, {
        method: 'GET'
      });

      return response.data as string[];
    } catch (error: any) {
      console.error('Error fetching entity types:', error);
      throw error;
    }
  }

  /**
   * Format action name for display
   */
  formatAction(accion: string): string {
    const actionMap: Record<string, string> = {
      'login': 'Inicio de sesión',
      'logout': 'Cierre de sesión',
      'create': 'Creación',
      'update': 'Actualización',
      'delete': 'Eliminación',
      'view': 'Visualización',
      'export': 'Exportación',
      'import': 'Importación',
      'password_change': 'Cambio de contraseña',
      'role_change': 'Cambio de rol',
      'status_change': 'Cambio de estado'
    };

    return actionMap[accion.toLowerCase()] || accion;
  }

  /**
   * Format entity type for display
   */
  formatEntityType(tipo: string | null): string {
    if (!tipo) return 'N/A';

    const typeMap: Record<string, string> = {
      'User': 'Usuario',
      'Caballo': 'Caballo',
      'Evento': 'Evento',
      'Establecimiento': 'Establecimiento',
      'Tarea': 'Tarea',
      'Role': 'Rol'
    };

    return typeMap[tipo] || tipo;
  }

  /**
   * Get icon for action
   */
  getActionIcon(accion: string): string {
    const iconMap: Record<string, string> = {
      'login': '🔐',
      'logout': '🚪',
      'create': '➕',
      'update': '✏️',
      'delete': '🗑️',
      'view': '👁️',
      'export': '📤',
      'import': '📥',
      'password_change': '🔑',
      'role_change': '🎭',
      'status_change': '🔄'
    };

    return iconMap[accion.toLowerCase()] || '📝';
  }

  /**
   * Get color for action
   */
  getActionColor(accion: string): string {
    const colorMap: Record<string, string> = {
      'login': 'text-green-600 bg-green-100',
      'logout': 'text-gray-600 bg-gray-100',
      'create': 'text-blue-600 bg-blue-100',
      'update': 'text-orange-600 bg-orange-100',
      'delete': 'text-red-600 bg-red-100',
      'view': 'text-purple-600 bg-purple-100',
      'export': 'text-indigo-600 bg-indigo-100',
      'import': 'text-teal-600 bg-teal-100',
      'password_change': 'text-yellow-600 bg-yellow-100',
      'role_change': 'text-pink-600 bg-pink-100',
      'status_change': 'text-cyan-600 bg-cyan-100'
    };

    return colorMap[accion.toLowerCase()] || 'text-gray-600 bg-gray-100';
  }
}

export const auditoriaService = new AuditoriaService();
