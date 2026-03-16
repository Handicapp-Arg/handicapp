/**
 * React Query Hooks
 *
 * Exports centralizados de todos los hooks de React Query
 * Importa cualquier hook desde esta ubicación central:
 *
 * @example
 * import { useCaballos, useEventos, useTareas } from '@/lib/hooks';
 */

// Horses (Gestión, Pedigrí, Historial)
export * from './useHorsesQuery';

// Tasks (Gestión, Asignaciones, Productividad)
export * from './useTasksQuery';

// Events (Gestión de Eventos, Salud, Entrenamientos, Competencias)
export * from './useEventsQuery';

// Stables (Gestión de Haras, Polos, etc.)
export * from './useStablesQuery';

// Notifications (Sistema de notificaciones)
export * from './useNotificationsQuery';

// Users (Gestión de usuarios y roles)
export * from './useUsersQuery';

// Audit (Logs del sistema)
export * from './useAuditQuery';

// Dashboard aggregates
export * from './useUpcomingEvents';
export * from './useOwnerDashboard';
export * from './useStats';

// Auth
export * from './useAuthNew';

// WebSocket y tiempo real
export * from './useWebSocket';
export * from './useNotifications';
export * from './useAutoRefresh';

// Task management
export * from './useTasks';
