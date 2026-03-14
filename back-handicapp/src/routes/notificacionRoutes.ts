// src/routes/notificacionRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Notificaciones
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { NotificacionController } from '../controllers/notificacionController';
import { requireAuth } from '../middleware/auth';
import { auditAccess } from '../middleware/authorization';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);
router.use(auditAccess());

// ====================================
// RUTAS ESPECÍFICAS (ANTES DE /:id)
// ====================================

router.get('/stats', NotificacionController.obtenerEstadisticas);
router.get('/contador', NotificacionController.obtenerContador);
router.get('/', NotificacionController.obtenerNotificaciones);

// PATCH: leer-multiples y leer-todas ANTES de /:id/leer
// (aunque /:id/leer requiere 2 segmentos y no conflictúa, es buena práctica)
router.patch('/leer-multiples', NotificacionController.marcarVariasComoLeidas);
router.patch('/leer-todas', NotificacionController.marcarTodasComoLeidas);

// DELETE: eliminar-multiples y eliminar-leidas ANTES de /:id
// CRÍTICO: si van después, Express matchea "eliminar-multiples" como id=eliminar-multiples
router.delete('/eliminar-multiples', NotificacionController.eliminarVarias);
router.delete('/eliminar-leidas', NotificacionController.eliminarLeidas);

// ====================================
// RUTAS CON PARÁMETROS (DESPUÉS)
// ====================================

router.get('/:id', NotificacionController.obtenerPorId);
router.patch('/:id/leer', NotificacionController.marcarComoLeida);
router.delete('/:id', NotificacionController.eliminar);

export { router as notificacionRoutes };
