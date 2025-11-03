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
} from '../services/eventoService';

export type { 
  Caballo, 
  PropietarioCaballo, 
  CaballoEstablecimiento,
  CaballoFilters 
} from '../services/caballoService';

export type { 
  Notificacion, 
  NotificacionFiltros, 
  NotificacionStats 
} from '../services/notificacionService';

// Tipos adicionales para reportes y estadísticas
export interface Tratamiento {
  id: number;
  caballo_id: number;
  tipo: string;
  descripcion: string;
  estado: 'activo' | 'completado' | 'suspendido' | 'cancelado';
  fecha_inicio: string;
  fecha_fin?: string;
  medicamento?: string;
  dosis?: string;
  frecuencia?: string;
  veterinario_id?: number;
  observaciones?: string;
  creado_el: string;
  actualizado_el: string;
  caballo?: {
    id: number;
    nombre: string;
    raza?: string;
  };
  veterinario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface Consulta {
  id: number;
  caballo_id: number;
  veterinario_id: number;
  tipo: string;
  motivo: string;
  diagnostico?: string;
  tratamiento_recomendado?: string;
  estado: 'programado' | 'en_progreso' | 'completado' | 'cancelado';
  fecha_consulta: string;
  fecha_proxima_revision?: string;
  temperatura?: number;
  frecuencia_cardiaca?: number;
  frecuencia_respiratoria?: number;
  observaciones?: string;
  costo?: number;
  creado_el: string;
  actualizado_el: string;
  caballo?: {
    id: number;
    nombre: string;
    raza?: string;
  };
  veterinario?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface EventoHistorial {
  id: number;
  tipo_evento_id: number;
  caballo_id: number;
  titulo: string;
  descripcion?: string;
  fecha_evento: string;
  estado: 'pendiente' | 'completado' | 'cancelado' | 'vencido';
  tipo?: string; // Alias para tipo_evento.nombre
  fecha?: string; // Alias para fecha_evento
  tipo_evento?: {
    nombre: string;
    categoria?: string;
  };
  veterinario?: {
    nombre: string;
    apellido: string;
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

export interface EstadisticasTratamientos extends EstadisticasBase {
  suspendidos: number;
  promedio_duracion_dias: number;
}

export interface EstadisticasConsultas extends EstadisticasBase {
  en_progreso: number;
  cancelados: number;
  promedio_costo: number;
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
