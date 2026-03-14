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

// Todas las rutas requieren autenticación
router.use(requireAuth);
router.use(auditAccess());

// ====================================
// CRUD BÁSICO
// ====================================

router.post(
  '/',
  requireRole('admin', 'establecimiento', 'capataz', 'veterinario', 'empleado'),
  tareaValidations.create,
  TareaController.create
);

router.get(
  '/',
  [...paramValidations.pagination, ...paramValidations.dateRange],
  TareaController.getAll
);

// ====================================
// RUTAS ESPECÍFICAS (ANTES DE /:id)
// ====================================

router.post(
  '/:id/completar',
  paramValidations.id,
  requirePermission('tasks:complete'),
  TareaController.completar
);

router.put(
  '/:id/estado',
  paramValidations.id,
  requirePermission('tasks:write'),
  tareaValidations.cambiarEstado,
  TareaController.cambiarEstado
);

router.post(
  '/:id/crear-evento',
  paramValidations.id,
  requirePermission('tasks:write'),
  TareaController.crearEvento
);

// ====================================
// CRUD POR ID
// ====================================

router.get(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:read'),
  TareaController.getById
);

router.put(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:write'),
  tareaValidations.update,
  TareaController.update
);

router.delete(
  '/:id',
  paramValidations.id,
  requirePermission('tasks:delete'),
  TareaController.delete
);

// ====================================
// ASIGNACIÓN
// ====================================

router.put(
  '/:id/asignar',
  paramValidations.id,
  requirePermission('tasks:assign'),
  tareaValidations.asignar,
  TareaController.asignar
);

export { router as tareaRoutes };
