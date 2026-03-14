// src/routes/eventoRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Eventos
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { param } from 'express-validator';
import { EventoController } from '../controllers/eventoController';
import { AdjuntoController } from '../controllers/adjuntoController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { eventoValidations, paramValidations, handleValidationErrors } from '../middleware/validation';

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);
router.use(auditAccess());

// ====================================
// CRUD BÁSICO
// ====================================

router.post(
  '/',
  requireRole('admin', 'establecimiento', 'veterinario', 'capataz', 'empleado'),
  eventoValidations.create,
  EventoController.create
);

router.get(
  '/',
  requirePermission('events:read'),
  [...paramValidations.pagination, ...paramValidations.dateRange],
  EventoController.getAll
);

// ====================================
// RUTAS ESPECÍFICAS (ANTES DE /:id)
// ====================================

router.get(
  '/programados',
  requirePermission('events:read'),
  EventoController.getProgramados
);

router.get(
  '/tipos',
  requirePermission('events:read'),
  EventoController.getTipos
);

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
// RUTAS CON PARÁMETROS DINÁMICOS
// ====================================

router.get(
  '/:id',
  paramValidations.id,
  requirePermission('events:read'),
  EventoController.getById
);

router.put(
  '/:id',
  paramValidations.id,
  requirePermission('events:write'),
  eventoValidations.update,
  EventoController.update
);

router.delete(
  '/:id',
  paramValidations.id,
  requirePermission('events:delete'),
  EventoController.delete
);

router.get(
  '/:id/adjuntos',
  paramValidations.id,
  requirePermission('events:read'),
  AdjuntoController.getByEvento
);

export { router as eventoRoutes };
