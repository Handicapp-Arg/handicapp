/**
 * Servicio de Notificaciones
 */

import ApiClient from './apiClient';

export interface Notificacion {
  id: number;
  tipo: 'evento' | 'tarea' | 'caballo' | 'sistema' | 'recordatorio';
  titulo: string;
  mensaje: string;
  leida: boolean;
  importante: boolean;
  url?: string;
  datos_adicionales?: any;
  usuario_id: number;
  creado_el: string;
  leido_el?: string;
}

export interface NotificacionFiltros {
  leida?: boolean;
  tipo?: string;
  importante?: boolean;
  fecha_desde?: string;
  fecha_hasta?: string;
  limit?: number;
  offset?: number;
}

export interface NotificacionStats {
  total: number;
  no_leidas: number;
  leidas: number;
  importantes: number;
  por_tipo: { [key: string]: number };
}

class NotificacionService {
  private baseUrl = '/notificaciones';

  async obtenerNotificaciones(filtros: NotificacionFiltros = {}): Promise<Notificacion[]> {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    const response = await ApiClient.makeRequest(url) as any;
    const notificaciones = response.data?.notificaciones || response.notificaciones || response.data || response || [];
    return Array.isArray(notificaciones) ? notificaciones : [];
  }

  async obtenerNotificacion(id: number): Promise<Notificacion> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`) as any;
  }

  async marcarComoLeida(id: number): Promise<Notificacion> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}/leer`, { method: 'PATCH' }) as any;
  }

  async marcarVariasComoLeidas(ids: number[]): Promise<{ success: boolean; updated: number }> {
    return ApiClient.makeRequest(`${this.baseUrl}/leer-multiples`, {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    }) as any;
  }

  async marcarTodasComoLeidas(): Promise<{ success: boolean; updated: number }> {
    return ApiClient.makeRequest(`${this.baseUrl}/leer-todas`, { method: 'PATCH' }) as any;
  }

  async eliminarNotificacion(id: number): Promise<{ success: boolean }> {
    return ApiClient.makeRequest(`${this.baseUrl}/${id}`, { method: 'DELETE' }) as any;
  }

  async eliminarVarias(ids: number[]): Promise<{ success: boolean; deleted: number }> {
    return ApiClient.makeRequest(`${this.baseUrl}/eliminar-multiples`, {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }) as any;
  }

  async eliminarLeidas(): Promise<{ success: boolean; deleted: number }> {
    return ApiClient.makeRequest(`${this.baseUrl}/eliminar-leidas`, { method: 'DELETE' }) as any;
  }

  async obtenerEstadisticas(): Promise<NotificacionStats> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/stats`) as any;
    return response.data || response;
  }

  async obtenerNoLeidas(limit = 10): Promise<Notificacion[]> {
    return this.obtenerNotificaciones({ leida: false, limit });
  }

  async obtenerImportantes(): Promise<Notificacion[]> {
    return this.obtenerNotificaciones({ importante: true });
  }

  async obtenerConteoNoLeidas(): Promise<number> {
    const stats = await this.obtenerEstadisticas();
    return stats.no_leidas;
  }

  async obtenerContadorNoLeidas(): Promise<number> {
    try {
      const response = await ApiClient.makeRequest(`${this.baseUrl}/contador`) as any;
      return response.data || response.count || response || 0;
    } catch {
      return 0;
    }
  }
}

export const notificacionService = new NotificacionService();
