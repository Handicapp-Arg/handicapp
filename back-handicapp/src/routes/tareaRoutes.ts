// src/routes/tareaRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Tareas
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { TareaController } from '../controllers/tareaController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { tareaValidations, paramValidations } from '../middleware/validation';

const router: ExpressRouter = Router();

// ====================================
// MIDDLEWARE GLOBAL
// ====================================

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Audit logging para todas las operaciones
router.use(auditAccess());

// ====================================
// CRUD BÁSICO
// ====================================

/**
 * @route   POST /api/v1/tareas
 * @desc    Crear nueva tarea
 * @access  Admin, Establecimiento, Capataz, Veterinario
 */
router.post(
  '/',
  requireRole('admin', 'establecimiento', 'capataz', 'veterinario'),
  tareaValidations.create,
  TareaController.create
);

/**
 * @route   GET /api/v1/tareas
 * @desc    Obtener todas las tareas con paginación y filtros
 * @access  Todos los autenticados
 */
router.get(
  '/',
  [
    ...paramValidations.pagination,
    ...paramValidations.dateRange
  ],
  TareaController.getAll
);

/**
 * @route   GET /api/v1/tareas/:id
 * @desc    Obtener tarea por ID
 * @access  Usuarios con acceso a la tarea
 */
router.get(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:read'),
  TareaController.getById
);

/**
 * @route   PUT /api/v1/tareas/:id
 * @desc    Actualizar tarea
 * @access  Admin, Usuario que creó la tarea, Usuario asignado
 */
router.put(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:write'),
  tareaValidations.update,
  TareaController.update
);

/**
 * @route   DELETE /api/v1/tareas/:id
 * @desc    Eliminar tarea (soft delete)
 * @access  Admin, Usuario que creó la tarea
 */
router.delete(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:delete'),
  TareaController.delete
);

// ====================================
// GESTIÓN DE ESTADO
// ====================================

/**
 * @route   POST /api/v1/tareas/:id/completar
 * @desc    Marcar tarea como completada
 * @access  Usuario asignado, Admin, Creador de la tarea
 */
router.post(
  '/:id/completar',
  paramValidations.id,
  requirePermission('tasks:complete'),
  TareaController.completar
);

/**
 * @route   PUT /api/v1/tareas/:id/estado
 * @desc    Cambiar estado de tarea
 * @access  Usuario asignado, Admin, Creador de la tarea
 */
router.put(
  '/:id/estado',
  paramValidations.id,
  requirePermission('tasks:write'),
  tareaValidations.cambiarEstado,
  TareaController.cambiarEstado
);

// ====================================
// ASIGNACIÓN DE TAREAS
// ====================================

/**
 * @route   PUT /api/v1/tareas/:id/asignar
 * @desc    Asignar tarea a usuario
 * @access  Admin, Creador de la tarea, Capataz
 */
router.put(
  '/:id/asignar',
  paramValidations.id,
  requirePermission('tasks:assign'),
  tareaValidations.asignar,
  TareaController.asignar
);

// ====================================
// TAREAS RECURRENTES
// ====================================

/**
 * @route   POST /api/v1/tareas/recurrente
 * @desc    Crear tarea recurrente
 * @access  Admin, Establecimiento, Capataz, Veterinario
 */
router.post(
  '/recurrente',
  requireRole('admin', 'establecimiento', 'capataz', 'veterinario'),
  TareaController.createRecurrente
);

// ====================================
// REPORTES Y DASHBOARDS
// ====================================

/**
 * @route   GET /api/v1/tareas/mis-tareas
 * @desc    Obtener tareas del usuario autenticado
 * @access  Todos los autenticados
 */
router.get(
  '/mis-tareas',
  requirePermission('tasks:read'),
  TareaController.getMisTareas
);

/**
 * @route   GET /api/v1/tareas/vencidas
 * @desc    Obtener tareas vencidas
 * @access  Admin, Establecimiento, Capataz
 */
router.get(
  '/vencidas',
  requirePermission('tasks:view_all'),
  TareaController.getTareasVencidas
);

/**
 * @route   GET /api/v1/tareas/estadisticas
 * @desc    Obtener estadísticas de tareas
 * @access  Admin, Establecimiento, Capataz
 */
router.get(
  '/estadisticas',
  requirePermission('tasks:view_all'),
  TareaController.getEstadisticas
);

/**
 * @route   GET /api/v1/tareas/productividad
 * @desc    Obtener resumen de productividad
 * @access  Admin, El propio usuario
 */
router.get(
  '/productividad',
  [
    ...paramValidations.dateRange
  ],
  TareaController.getProductividad
);

export { router as tareaRoutes };