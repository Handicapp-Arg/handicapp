/**
 * Servicio de Notificaciones
 * Gestión completa de notificaciones del sistema
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
  por_tipo: {
    [key: string]: number;
  };
}

class NotificacionService {
  private baseUrl = '/notificaciones';

  /**
   * Obtener todas las notificaciones del usuario actual
   */
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
    
    // El backend devuelve { success: true, data: { notificaciones: [...], total, totalPages } }
    const notificaciones = response.data?.notificaciones || response.notificaciones || response.data || response || [];
    return Array.isArray(notificaciones) ? notificaciones : [];
  }

  /**
   * Obtener una notificación por ID
   */
  async obtenerNotificacion(id: number): Promise<Notificacion> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`) as any;
    return response;
  }

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(id: number): Promise<Notificacion> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}/leer`, {
      method: 'PATCH'
    }) as any;
    return response;
  }

  /**
   * Marcar múltiples notificaciones como leídas
   */
  async marcarVariasComoLeidas(ids: number[]): Promise<{ success: boolean; updated: number }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/leer-multiples`, {
      method: 'PATCH',
      body: JSON.stringify({ ids })
    }) as any;
    return response;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(): Promise<{ success: boolean; updated: number }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/leer-todas`, {
      method: 'PATCH'
    }) as any;
    return response;
  }

  /**
   * Eliminar una notificación
   */
  async eliminarNotificacion(id: number): Promise<{ success: boolean }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    }) as any;
    return response;
  }

  /**
   * Eliminar múltiples notificaciones
   */
  async eliminarVarias(ids: number[]): Promise<{ success: boolean; deleted: number }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/eliminar-multiples`, {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    }) as any;
    return response;
  }

  /**
   * Eliminar todas las notificaciones leídas
   */
  async eliminarLeidas(): Promise<{ success: boolean; deleted: number }> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/eliminar-leidas`, {
      method: 'DELETE'
    }) as any;
    return response;
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async obtenerEstadisticas(): Promise<NotificacionStats> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/stats`) as any;
    return response;
  }

  /**
   * Obtener notificaciones no leídas
   */
  async obtenerNoLeidas(limit = 10): Promise<Notificacion[]> {
    return this.obtenerNotificaciones({ leida: false, limit });
  }

  /**
   * Obtener notificaciones importantes
   */
  async obtenerImportantes(): Promise<Notificacion[]> {
    return this.obtenerNotificaciones({ importante: true });
  }

  /**
   * Obtener el conteo de notificaciones no leídas
   */
  async obtenerConteoNoLeidas(): Promise<number> {
    const stats = await this.obtenerEstadisticas();
    return stats.no_leidas;
  }

  /**
   * Crear una notificación de prueba (solo desarrollo)
   */
  async crearNotificacionPrueba(tipo: Notificacion['tipo'], titulo: string, mensaje: string): Promise<Notificacion> {
    const response = await ApiClient.makeRequest(`${this.baseUrl}/test`, {
      method: 'POST',
      body: JSON.stringify({ tipo, titulo, mensaje })
    }) as any;
    return response;
  }
}

export const notificacionService = new NotificacionService();
