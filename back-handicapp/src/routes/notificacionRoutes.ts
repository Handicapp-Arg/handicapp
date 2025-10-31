// src/routes/notificacionRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Notificaciones
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { NotificacionController } from '../controllers/notificacionController';
import { requireAuth } from '../middleware/auth';
import { auditAccess } from '../middleware/authorization';

const router: ExpressRouter = Router();

// ====================================
// MIDDLEWARE GLOBAL
// ====================================

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Audit logging
router.use(auditAccess());

// ====================================
// RUTAS
// ====================================

/**
 * @route   GET /api/v1/notificaciones/stats
 * @desc    Obtener estadísticas de notificaciones del usuario
 * @access  Usuario autenticado
 */
router.get('/stats', NotificacionController.obtenerEstadisticas);

/**
 * @route   GET /api/v1/notificaciones/contador
 * @desc    Obtener contador de notificaciones no leídas
 * @access  Usuario autenticado
 */
router.get('/contador', NotificacionController.obtenerContador);

/**
 * @route   GET /api/v1/notificaciones
 * @desc    Obtener todas las notificaciones del usuario con filtros
 * @query   ?page=1&limit=50&tipo=evento&leida=false
 * @access  Usuario autenticado
 */
router.get('/', NotificacionController.obtenerNotificaciones);

/**
 * @route   GET /api/v1/notificaciones/:id
 * @desc    Obtener una notificación por ID
 * @access  Usuario autenticado (solo sus propias notificaciones)
 */
router.get('/:id', NotificacionController.obtenerPorId);

/**
 * @route   PATCH /api/v1/notificaciones/:id/leer
 * @desc    Marcar una notificación como leída
 * @access  Usuario autenticado (solo sus propias notificaciones)
 */
router.patch('/:id/leer', NotificacionController.marcarComoLeida);

/**
 * @route   PATCH /api/v1/notificaciones/leer-multiples
 * @desc    Marcar múltiples notificaciones como leídas
 * @body    { ids: [1, 2, 3] }
 * @access  Usuario autenticado
 */
router.patch('/leer-multiples', NotificacionController.marcarVariasComoLeidas);

/**
 * @route   PATCH /api/v1/notificaciones/leer-todas
 * @desc    Marcar todas las notificaciones como leídas
 * @access  Usuario autenticado
 */
router.patch('/leer-todas', NotificacionController.marcarTodasComoLeidas);

/**
 * @route   DELETE /api/v1/notificaciones/:id
 * @desc    Eliminar una notificación
 * @access  Usuario autenticado (solo sus propias notificaciones)
 */
router.delete('/:id', NotificacionController.eliminar);

/**
 * @route   DELETE /api/v1/notificaciones/eliminar-multiples
 * @desc    Eliminar múltiples notificaciones
 * @body    { ids: [1, 2, 3] }
 * @access  Usuario autenticado
 */
router.delete('/eliminar-multiples', NotificacionController.eliminarVarias);

/**
 * @route   DELETE /api/v1/notificaciones/eliminar-leidas
 * @desc    Eliminar todas las notificaciones leídas
 * @access  Usuario autenticado
 */
router.delete('/eliminar-leidas', NotificacionController.eliminarLeidas);

export { router as notificacionRoutes };
