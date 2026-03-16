/**
 * Tipos Centralizados - Handicapp
 * Definiciones de tipos compartidos para toda la aplicación
 */

// Re-exportar tipos de servicios
export type { 
  Evento, 
  CreateEventoData, 
  EventoFormData, 
  EventoFilters 
} from '../services/eventService';

export type { 
  Caballo, 
  PropietarioCaballo, 
  CaballoEstablecimiento,
  CaballoFilters 
} from '../services/horseService';

export type { 
  Notificacion, 
  NotificacionFiltros, 
  NotificacionStats 
} from '../services/notificationService';

// Tipos adicionales para reportes y estadísticas
export interface EventoHistorial {
  id: number;
  tipo_evento_id: number;
  caballo_id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'vencido';
  tipo?: string;
  fecha?: string;
  tipo_evento?: {
    nombre: string;
    categoria?: string;
  };
  creado_el: string;
}

// Tipos de filtros comunes
export interface FiltroFecha {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface FiltroPaginacion {
  page?: number;
  limit?: number;
}

export interface FiltroEstado {
  estado?: string;
}

// Tipos de estadísticas
export interface EstadisticasBase {
  total: number;
  activos: number;
  completados: number;
  pendientes: number;
}

// Tipos para reportes
export interface ReporteCaballo {
  id: number;
  nombre: string;
  raza?: string | null;
  edad?: number;
  sexo?: 'macho' | 'hembra' | null;
  disciplina?: 'polo' | 'equitacion' | 'turf' | null;
  estado_global: 'activo' | 'inactivo' | 'vendido' | 'fallecido';
  total_eventos: number;
  ultimo_evento?: string;
  establecimientos?: string[];
}

// Tipos auxiliares
export type EstadoEvento = 'pendiente' | 'completado' | 'cancelado' | 'vencido';
export type EstadoTratamiento = 'activo' | 'completado' | 'suspendido' | 'cancelado';
export type EstadoConsulta = 'programado' | 'en_progreso' | 'completado' | 'cancelado';
export type PrioridadEvento = 'baja' | 'media' | 'alta' | 'critica';
export type TipoNotificacion = 'evento' | 'tarea' | 'caballo' | 'sistema' | 'recordatorio';
