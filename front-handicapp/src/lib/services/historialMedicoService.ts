/**
 * Servicio para gestión de historial médico veterinario
 */

import ApiClient from './apiClient';
import type { Evento } from './eventoService';

export interface RegistroMedico extends Evento {
  tipo_consulta?: 'revision' | 'emergencia' | 'seguimiento' | 'cirugia' | 'vacunacion';
  diagnostico?: string;
  tratamiento?: string;
  medicamentos?: string;
  proximo_control?: string;
  gravedad?: 'leve' | 'moderado' | 'grave' | 'critico';
  tipo?: string;
}

export interface FiltrosHistorial {
  caballoId?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  tipo?: string;
  veterinarioId?: number;
  gravedad?: string;
}

class HistorialMedicoService {
  /**
   * Obtener historial médico completo de un caballo
   */
  async getHistorialCaballo(caballoId: number): Promise<RegistroMedico[]> {
    try {
      const response = await ApiClient.makeRequest<{ data: RegistroMedico[] }>(`/caballos/${caballoId}/historial-medico`, { method: 'GET' });
      return response.data;
    } catch (error) {
      console.error('Error fetching historial:', error);
      return [];
    }
  }

  /**
   * Obtener eventos médicos filtrados
   */
  async getEventosMedicos(filtros: FiltrosHistorial = {}): Promise<RegistroMedico[]> {
    const params: Record<string, string> = {};
    
    if (filtros.caballoId) params.caballo_id = String(filtros.caballoId);
    if (filtros.fechaDesde) params.fecha_desde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fecha_hasta = filtros.fechaHasta;
    if (filtros.tipo) params.tipo = filtros.tipo;
    if (filtros.veterinarioId) params.veterinario = String(filtros.veterinarioId);
    if (filtros.gravedad) params.gravedad = filtros.gravedad;

    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/eventos?${queryParams}` : '/eventos';
    const response = await ApiClient.makeRequest<{ data: RegistroMedico[] }>(endpoint, { method: 'GET' });
    
    return response.data || [];
  }

  /**
   * Crear registro médico
   */
  async crearRegistro(data: Partial<RegistroMedico>): Promise<RegistroMedico> {
    const response = await ApiClient.makeRequest<{ data: RegistroMedico }>('/eventos', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        categoria: 'medico'
      })
    });
    return response.data;
  }

  /**
   * Actualizar registro médico
   */
  async actualizarRegistro(id: number, data: Partial<RegistroMedico>): Promise<RegistroMedico> {
    const response = await ApiClient.makeRequest<{ data: RegistroMedico }>(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.data;
  }

  /**
   * Obtener registros recientes
   */
  async getRegistrosRecientes(limit: number = 10): Promise<RegistroMedico[]> {
    const queryParams = new URLSearchParams({
      categoria: 'medico',
      limit: String(limit),
      sort: 'fecha_evento',
      order: 'desc'
    }).toString();
    const response = await ApiClient.makeRequest<{ data: RegistroMedico[] }>(`/eventos?${queryParams}`, { method: 'GET' });
    return response.data || [];
  }

  /**
   * Obtener estadísticas médicas
   */
  async getEstadisticasMedicas(caballoId?: number): Promise<{
    total: number;
    porTipo: Record<string, number>;
    ultimaVisita?: string;
    proximaRevision?: string;
  }> {
    try {
      const filtros: FiltrosHistorial = {};
      if (caballoId) filtros.caballoId = caballoId;

      const registros = await this.getEventosMedicos(filtros);
      
      const porTipo = registros.reduce((acc, reg) => {
        const tipo = reg.tipo || 'otro';
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const ultimaVisita = registros.length > 0 
        ? registros.sort((a, b) => 
            new Date(b.fecha_evento || '').getTime() - new Date(a.fecha_evento || '').getTime()
          )[0].fecha_evento
        : undefined;

      return {
        total: registros.length,
        porTipo,
        ultimaVisita,
        proximaRevision: undefined // Se puede calcular según reglas de negocio
      };
    } catch {
      return {
        total: 0,
        porTipo: {}
      };
    }
  }

  /**
   * Validar evento médico (solo veterinarios)
   */
  async validarEvento(eventoId: number, observaciones?: string): Promise<RegistroMedico> {
    const response = await ApiClient.makeRequest<{ data: RegistroMedico }>(`/eventos/${eventoId}/validar`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    });
    return response.data;
  }

  /**
   * Obtener calendario de consultas
   */
  async getCalendarioConsultas(mes: number, anio: number): Promise<RegistroMedico[]> {
    const fechaInicio = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
    const fechaFin = new Date(anio, mes, 0).toISOString().split('T')[0];

    return this.getEventosMedicos({
      fechaDesde: fechaInicio,
      fechaHasta: fechaFin
    });
  }
}

export const historialMedicoService = new HistorialMedicoService();
export default historialMedicoService;
