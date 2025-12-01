/**
 * Analytics Service
 * Servicio para obtener métricas y estadísticas del sistema
 */

import { apiClient } from '@/lib/http';

interface UsuarioSummary {
  estado?: string | null;
  creado_el?: string;
  role?: {
    nombre?: string;
  } | null;
}

interface CaballoSummary {
  creado_el?: string;
}

interface EventoSummary {
  fecha?: string;
  tipo_evento?: {
    nombre?: string;
  } | null;
  tipo?: string;
}

interface TareaSummary {
  estado?: string;
}

interface EstablecimientoSummary {
  estado?: string;
}

interface AuditoriaStatsResponse {
  data?: {
    total?: number;
    last24h?: number;
    last7days?: number;
  };
}

interface UsuariosApiResponse {
  data?: UsuarioSummary[] | {
    usuarios?: UsuarioSummary[];
  };
}

interface CaballosApiResponse {
  data?: CaballoSummary[] | {
    caballos?: CaballoSummary[];
  };
}

interface EstablecimientosApiResponse {
  data?: EstablecimientoSummary[] | {
    establecimientos?: EstablecimientoSummary[];
  };
}

interface EventosApiResponse {
  data?: EventoSummary[] | {
    eventos?: EventoSummary[];
    data?: EventoSummary[];
  };
}

interface TareasApiResponse {
  data?: TareaSummary[] | {
    data?: TareaSummary[];
  };
}

export interface SystemStats {
  usuarios: {
    total: number;
    activos: number;
    nuevosUltimoMes: number;
    porRol: Array<{
      rol: string;
      count: number;
    }>;
  };
  caballos: {
    total: number;
    porEstablecimiento: number;
    nuevosUltimoMes: number;
  };
  establecimientos: {
    total: number;
    activos: number;
  };
  eventos: {
    total: number;
    ultimaSemana: number;
    porTipo: Array<{
      tipo: string;
      count: number;
    }>;
  };
  tareas: {
    total: number;
    pendientes: number;
    completadas: number;
    enProceso: number;
  };
  auditoria: {
    totalAcciones: number;
    ultimoDia: number;
    ultimaSemana: number;
  };
}

export interface ActivityData {
  date: string;
  usuarios: number;
  eventos: number;
  tareas: number;
}

export interface UsageMetrics {
  avgResponseTime: number;
  requestsPerHour: number;
  errorRate: number;
  activeUsers: number;
}

export interface GrowthData {
  periodo: string;
  usuarios: number;
  caballos: number;
  eventos: number;
  tareas: number;
}

class AnalyticsService {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getSystemStats(): Promise<SystemStats> {
    try {
      // Llamadas paralelas a diferentes endpoints
      const [
        usuarios,
        caballos,
        establecimientos,
        eventos,
        tareas,
        auditoria
      ] = await Promise.all([
        apiClient.get<UsuariosApiResponse>('/users?limit=1000'),
        apiClient.get<CaballosApiResponse>('/caballos?limit=1000'),
        apiClient.get<EstablecimientosApiResponse>('/establecimientos?limit=1000'),
        apiClient.get<EventosApiResponse>('/eventos?limit=1000'),
        apiClient.get<TareasApiResponse>('/tareas?limit=1000'),
        apiClient.get<AuditoriaStatsResponse>('/auditoria/stats'),
      ]);

      // Procesar datos de usuarios
      const usuariosData: UsuarioSummary[] = Array.isArray(usuarios.data) 
        ? usuarios.data 
        : usuarios.data?.usuarios || [];

      const now = new Date();
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const usuariosActivos = usuariosData.filter((u: any) => u.estado === 'activo').length;
      const nuevosUsuarios = usuariosData.filter((u: any) => 
        new Date(u.creado_el) > lastMonth
      ).length;

      // Contar usuarios por rol
      const rolesCounts: Record<string, number> = {};
      usuariosData.forEach((u: any) => {
        const roleName = u.role?.nombre || 'Sin rol';
        rolesCounts[roleName] = (rolesCounts[roleName] || 0) + 1;
      });

      const porRol = Object.entries(rolesCounts).map(([rol, count]) => ({
        rol,
        count: count as number
      }));

      // Procesar datos de caballos
      const caballosData: CaballoSummary[] = Array.isArray(caballos.data)
        ? caballos.data
        : caballos.data?.caballos || [];

      const nuevosCaballos = caballosData.filter((c: any) =>
        new Date(c.creado_el) > lastMonth
      ).length;

      // Procesar eventos
      const eventosData: EventoSummary[] = Array.isArray(eventos.data)
        ? eventos.data
        : eventos.data?.eventos || eventos.data?.data || [];

      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const eventosUltimaSemana = eventosData.filter((e: any) =>
        new Date(e.fecha) > lastWeek
      ).length;

      const tiposCounts: Record<string, number> = {};
      eventosData.forEach((e: any) => {
        const tipo = e.tipo_evento?.nombre || e.tipo || 'Otro';
        tiposCounts[tipo] = (tiposCounts[tipo] || 0) + 1;
      });

      const porTipo = Object.entries(tiposCounts).map(([tipo, count]) => ({
        tipo,
        count: count as number
      }));

      // Procesar tareas
      const tareasData: TareaSummary[] = Array.isArray(tareas.data)
        ? tareas.data
        : tareas.data?.data || [];

      const tareasPendientes = tareasData.filter((t: any) => t.estado === 'pendiente').length;
      const tareasCompletadas = tareasData.filter((t: any) => t.estado === 'completada').length;
      const tareasEnProceso = tareasData.filter((t: any) => t.estado === 'en_proceso').length;

      // Procesar establecimientos
      const establecimientosData: EstablecimientoSummary[] = Array.isArray(establecimientos.data)
        ? establecimientos.data
        : establecimientos.data?.establecimientos || [];

      const establecimientosActivos = establecimientosData.filter((e: any) => 
        e.estado === 'activo'
      ).length;

      return {
        usuarios: {
          total: usuariosData.length,
          activos: usuariosActivos,
          nuevosUltimoMes: nuevosUsuarios,
          porRol,
        },
        caballos: {
          total: caballosData.length,
          porEstablecimiento: establecimientosData.length,
          nuevosUltimoMes: nuevosCaballos,
        },
        establecimientos: {
          total: establecimientosData.length,
          activos: establecimientosActivos,
        },
        eventos: {
          total: eventosData.length,
          ultimaSemana: eventosUltimaSemana,
          porTipo,
        },
        tareas: {
          total: tareasData.length,
          pendientes: tareasPendientes,
          completadas: tareasCompletadas,
          enProceso: tareasEnProceso,
        },
        auditoria: {
          totalAcciones: auditoria.data?.total || 0,
          ultimoDia: auditoria.data?.last24h || 0,
          ultimaSemana: auditoria.data?.last7days || 0,
        },
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de actividad de los últimos 30 días
   */
  async getActivityData(days: number = 30): Promise<ActivityData[]> {
    try {
      // Simulación de datos de actividad
      // En producción, esto vendría de un endpoint específico
      const data: ActivityData[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: date.toISOString().split('T')[0],
          usuarios: Math.floor(Math.random() * 50) + 10,
          eventos: Math.floor(Math.random() * 30) + 5,
          tareas: Math.floor(Math.random() * 40) + 10,
        });
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo datos de actividad:', error);
      throw error;
    }
  }

  /**
   * Obtener métricas de uso del sistema
   */
  async getUsageMetrics(): Promise<UsageMetrics> {
    try {
      // Simulación - En producción vendría del backend
      return {
        avgResponseTime: Math.random() * 500 + 100, // 100-600ms
        requestsPerHour: Math.floor(Math.random() * 1000) + 500,
        errorRate: Math.random() * 2, // 0-2%
        activeUsers: Math.floor(Math.random() * 50) + 10,
      };
    } catch (error) {
      console.error('Error obteniendo métricas de uso:', error);
      throw error;
    }
  }

  /**
   * Obtener datos de crecimiento
   */
  async getGrowthData(): Promise<GrowthData[]> {
    try {
      const stats = await this.getSystemStats();
      
      // Simulación de datos históricos
      // En producción, esto vendría de la base de datos
      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const currentMonth = new Date().getMonth();
      
      const data: GrowthData[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const factor = (12 - i) / 12; // Factor de crecimiento
        
        data.push({
          periodo: meses[monthIndex],
          usuarios: Math.floor(stats.usuarios.total * factor * (0.8 + Math.random() * 0.2)),
          caballos: Math.floor(stats.caballos.total * factor * (0.8 + Math.random() * 0.2)),
          eventos: Math.floor(stats.eventos.total * factor * (0.8 + Math.random() * 0.2)),
          tareas: Math.floor(stats.tareas.total * factor * (0.8 + Math.random() * 0.2)),
        });
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo datos de crecimiento:', error);
      throw error;
    }
  }

  /**
   * Calcular tasa de crecimiento
   */
  calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Formatear número grande
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Formatear porcentaje
   */
  formatPercentage(num: number): string {
    return num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  }

  /**
   * Obtener color para tasa de crecimiento
   */
  getGrowthColor(rate: number): string {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Obtener icono para tasa de crecimiento
   */
  getGrowthIcon(rate: number): string {
    if (rate > 0) return '↗';
    if (rate < 0) return '↘';
    return '→';
  }
}

export const analyticsService = new AnalyticsService();
