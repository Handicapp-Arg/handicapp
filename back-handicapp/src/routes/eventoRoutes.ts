// src/routes/eventoRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Eventos
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { param } from 'express-validator';
import { EventoController } from '../controllers/eventoController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { eventoValidations, paramValidations, handleValidationErrors } from '../middleware/validation';

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
 * @route   POST /api/v1/eventos
 * @desc    Crear nuevo evento
 * @access  Admin, Establecimiento, Veterinario
 */
router.post(
  '/',
  requireRole('admin', 'establecimiento', 'veterinario'),
  eventoValidations.create,
  EventoController.create
);

/**
 * @route   GET /api/v1/eventos
 * @desc    Obtener todos los eventos con paginación y filtros
 * @access  Todos los autenticados
 */
router.get(
  '/',
  [
    ...paramValidations.pagination,
    ...paramValidations.dateRange
  ],
  EventoController.getAll
);

/**
 * @route   GET /api/v1/eventos/:id
 * @desc    Obtener evento por ID
 * @access  Usuarios con acceso al evento
 */
router.get(
  '/:id',
  paramValidations.id,
  requirePermission('events:read'),
  EventoController.getById
);

/**
 * @route   PUT /api/v1/eventos/:id
 * @desc    Actualizar evento
 * @access  Admin, Veterinario que creó el evento, Usuario autorizado
 */
router.put(
  '/:id',
  paramValidations.id,
  requirePermission('events:write'),
  eventoValidations.update,
  EventoController.update
);

/**
 * @route   DELETE /api/v1/eventos/:id
 * @desc    Eliminar evento (soft delete)
 * @access  Admin, Veterinario que creó el evento
 */
router.delete(
  '/:id',
  paramValidations.id,
  requirePermission('events:delete'),
  EventoController.delete
);

// ====================================
// TIPOS DE EVENTO
// ====================================

/**
 * @route   GET /api/v1/eventos/tipos
 * @desc    Obtener tipos de eventos disponibles
 * @access  Todos los autenticados
 */
router.get(
  '/tipos',
  EventoController.getTipos
);

// ====================================
// HISTORIAL MÉDICO
// ====================================

/**
 * @route   GET /api/v1/eventos/historial-medico/caballo/:caballoId
 * @desc    Obtener historial médico completo de un caballo
 * @access  Propietario, Veterinario autorizado
 */
router.get(
  '/historial-medico/caballo/:caballoId',
  [
    param('caballoId').isInt({ min: 1 }).withMessage('ID de caballo debe ser válido'),
    handleValidationErrors
  ],
  requirePermission('horses:view_medical'),
  EventoController.getHistorialMedico
);

// ====================================
// EVENTOS PROGRAMADOS
// ====================================

/**
 * @route   GET /api/v1/eventos/programados
 * @desc    Obtener eventos programados (próximos)
 * @access  Todos los autenticados
 */
router.get(
  '/programados',
  requirePermission('events:read'),
  EventoController.getProgramados
);

// ====================================
// REPORTES Y ESTADÍSTICAS
// ====================================

/**
 * @route   GET /api/v1/eventos/reporte
 * @desc    Obtener reporte de eventos por periodo
 * @access  Admin, Establecimiento autorizado
 */
router.get(
  '/reporte',
  paramValidations.dateRange,
  requirePermission('events:view_reports'),
  EventoController.getReporte
);

/**
 * @route   GET /api/v1/eventos/estadisticas
 * @desc    Obtener estadísticas de eventos
 * @access  Admin, Establecimiento autorizado
 */
router.get(
  '/estadisticas',
  requirePermission('events:view_reports'),
  EventoController.getEstadisticas
);

// ====================================
// ADJUNTOS
// ====================================

/**
 * @route   POST /api/v1/eventos/:id/adjuntos
 * @desc    Agregar adjunto a evento
 * @access  Veterinario que creó el evento, Admin
 */
router.post(
  '/:id/adjuntos',
  paramValidations.id,
  requirePermission('events:write'),
  eventoValidations.addAdjunto,
  EventoController.addAdjunto
);

/**
 * @route   GET /api/v1/eventos/:id/adjuntos
 * @desc    Obtener adjuntos de un evento
 * @access  Usuarios con acceso al evento
 */
router.get(
  '/:id/adjuntos',
  paramValidations.id,
  requirePermission('events:read'),
  EventoController.getAdjuntos
);

export { router as eventoRoutes };