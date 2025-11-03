/**
 * Auditoría Service
 * Gestión completa de logs de auditoría del sistema
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';

export interface Auditoria {
  id: number;
  actor_usuario_id: number;
  accion: string;
  entidad_tipo: string | null;
  entidad_id: number | null;
  metadatos_json: string | null;
  ip: string | null;
  user_agent: string | null;
  creado_el: Date | string;
  actor_usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
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

export interface AuditoriaResponse {
  auditorias: Auditoria[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditoriaStats {
  total: number;
  last24h: number;
  last7days: number;
  last30days: number;
  topActions: Array<{
    accion: string;
    count: string | number;
  }>;
  topUsers: Array<{
    actor_usuario_id: number;
    count: string | number;
    actor_usuario: {
      nombre: string;
      apellido: string;
      email: string;
    };
  }>;
  entityTypes: Array<{
    entidad_tipo: string;
    count: string | number;
  }>;
}

class AuditoriaService {
  /**
   * Obtener logs de auditoría con filtros
   */
  async getAuditorias(filters: AuditoriaFilters = {}): Promise<AuditoriaResponse> {
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
    const url = `${API_BASE}/api/v1/auditoria${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener auditorías');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener estadísticas de auditoría
   */
  async getStats(): Promise<AuditoriaStats> {
    const response = await fetch(`${API_BASE}/api/v1/auditoria/stats`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener estadísticas');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener una auditoría por ID
   */
  async getAuditoriaById(id: number): Promise<Auditoria> {
    const response = await fetch(`${API_BASE}/api/v1/auditoria/${id}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener auditoría');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener lista de acciones únicas (para filtros)
   */
  async getActions(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/v1/auditoria/actions`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener acciones');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Obtener tipos de entidad únicos (para filtros)
   */
  async getEntityTypes(): Promise<string[]> {
    const response = await fetch(`${API_BASE}/api/v1/auditoria/entity-types`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener tipos de entidad');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Exportar auditorías a CSV
   */
  exportToCSV(auditorias: Auditoria[]): void {
    const headers = [
      'ID',
      'Fecha/Hora',
      'Usuario',
      'Email',
      'Acción',
      'Entidad',
      'Entidad ID',
      'IP',
      'User Agent'
    ];

    const rows = auditorias.map(a => [
      a.id,
      new Date(a.creado_el).toLocaleString('es-AR'),
      a.actor_usuario ? `${a.actor_usuario.nombre} ${a.actor_usuario.apellido}` : 'N/A',
      a.actor_usuario?.email || 'N/A',
      a.accion,
      a.entidad_tipo || 'N/A',
      a.entidad_id || 'N/A',
      a.ip || 'N/A',
      a.user_agent || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Formatear metadatos JSON
   */
  formatMetadata(metadatos_json: string | null): Record<string, any> | null {
    if (!metadatos_json) return null;
    try {
      return JSON.parse(metadatos_json);
    } catch {
      return null;
    }
  }

  /**
   * Obtener color para tipo de acción
   */
  getActionColor(accion: string): string {
    const actionMap: Record<string, string> = {
      'LOGIN': 'bg-green-100 text-green-800',
      'LOGOUT': 'bg-gray-100 text-gray-800',
      'CREATE': 'bg-blue-100 text-blue-800',
      'UPDATE': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'VIEW': 'bg-purple-100 text-purple-800',
      'EXPORT': 'bg-indigo-100 text-indigo-800',
    };

    const upperAction = accion.toUpperCase();
    for (const [key, value] of Object.entries(actionMap)) {
      if (upperAction.includes(key)) return value;
    }
    
    return 'bg-gray-100 text-gray-800';
  }

  /**
   * Obtener icono para tipo de acción
   */
  getActionIcon(accion: string): string {
    const upperAction = accion.toUpperCase();
    if (upperAction.includes('LOGIN')) return '🔐';
    if (upperAction.includes('LOGOUT')) return '🚪';
    if (upperAction.includes('CREATE')) return '➕';
    if (upperAction.includes('UPDATE')) return '✏️';
    if (upperAction.includes('DELETE')) return '🗑️';
    if (upperAction.includes('VIEW')) return '👁️';
    if (upperAction.includes('EXPORT')) return '📤';
    return '📋';
  }
}

export const auditoriaService = new AuditoriaService();
