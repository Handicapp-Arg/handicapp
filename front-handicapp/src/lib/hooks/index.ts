/**
 * React Query Hooks
 * 
 * Exports centralizados de todos los hooks de React Query
 * Importa cualquier hook desde esta ubicación central:
 * 
 * @example
 * import { useProductos, useEmpleados, useCaballos } from '@/lib/hooks';
 */

// Inventario
export * from './useInventarioQuery';

// Personal (Empleados, Horarios, Turnos, Ausencias)
export * from './usePersonalQuery';

// Reportes Médicos (Historial Clínico, Consultas, Tratamientos)
export * from './useReportesQuery';

// Caballos (Gestión, Pedigrí, Historial)
export * from './useCaballosQuery';

// Tareas (Gestión, Asignaciones, Productividad)
export * from './useTareasQuery';

// Eventos (Gestión de Eventos, Salud, Entrenamientos, Competencias)
export * from './useEventosQuery';

// Establecimientos (Gestión de Haras, Polos, etc.)
export * from './useEstablecimientosQuery';

// Notificaciones (Sistema de notificaciones)
export * from './useNotificacionesQuery';

// Usuarios (Gestión de usuarios y roles)
export * from './useUsuariosQuery';

// Auditoría (Logs del sistema)
export * from './useAuditoriaQuery';
