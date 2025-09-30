// src/routes/caballoRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Caballos
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { CaballoController } from '../controllers/caballoController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { caballoValidations, paramValidations } from '../middleware/validation';

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
 * @route   POST /api/v1/caballos
 * @desc    Crear nuevo caballo
 * @access  Admin, Establecimiento, Propietario, Veterinario
 */
router.post(
  '/',
  requireRole('admin', 'establecimiento', 'propietario', 'veterinario'),
  caballoValidations.create,
  CaballoController.create
);

/**
 * @route   GET /api/v1/caballos
 * @desc    Obtener todos los caballos con paginación y filtros
 * @access  Todos los autenticados
 */
router.get(
  '/',
  paramValidations.pagination,
  CaballoController.getAll
);

/**
 * @route   GET /api/v1/caballos/:id
 * @desc    Obtener caballo por ID
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getById
);

/**
 * @route   PUT /api/v1/caballos/:id
 * @desc    Actualizar caballo
 * @access  Admin, Propietario del caballo, Veterinario autorizado
 */
router.put(
  '/:id',
  paramValidations.id,
  requirePermission('horses:write'),
  caballoValidations.update,
  CaballoController.update
);

/**
 * @route   DELETE /api/v1/caballos/:id
 * @desc    Eliminar caballo (soft delete)
 * @access  Admin únicamente
 */
router.delete(
  '/:id',
  paramValidations.id,
  requireRole('admin'),
  CaballoController.delete
);

// ====================================
// GESTIÓN DE PROPIETARIOS
// ====================================

/**
 * @route   POST /api/v1/caballos/:id/propietarios
 * @desc    Agregar propietario al caballo
 * @access  Admin, Propietario actual del caballo
 */
router.post(
  '/:id/propietarios',
  paramValidations.id,
  requirePermission('horses:manage_owners'),
  caballoValidations.addPropietario,
  CaballoController.addPropietario
);

/**
 * @route   GET /api/v1/caballos/:id/propietarios
 * @desc    Obtener propietarios del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/propietarios',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getPropietarios
);

// ====================================
// GENEALOGÍA
// ====================================

/**
 * @route   GET /api/v1/caballos/:id/pedigree
 * @desc    Obtener pedigrí del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/pedigree',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getPedigree
);

/**
 * @route   GET /api/v1/caballos/:id/descendencia
 * @desc    Obtener descendencia del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/descendencia',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getDescendencia
);

// ====================================
// HISTORIAL MÉDICO
// ====================================

/**
 * @route   GET /api/v1/caballos/:id/historial-medico
 * @desc    Obtener historial médico del caballo
 * @access  Propietario, Veterinario autorizado
 */
router.get(
  '/:id/historial-medico',
  paramValidations.id,
  requirePermission('horses:view_medical'),
  CaballoController.getHistorialMedico
);

// ====================================
// CAMBIO DE ESTABLECIMIENTO
// ====================================

/**
 * @route   POST /api/v1/caballos/:id/mover-establecimiento
 * @desc    Mover caballo a otro establecimiento
 * @access  Admin, Propietario del caballo
 */
router.post(
  '/:id/mover-establecimiento',
  paramValidations.id,
  requirePermission('horses:write'),
  CaballoController.moverEstablecimiento
);

// ====================================
// ESTADÍSTICAS
// ====================================

/**
 * @route   GET /api/v1/caballos/:id/estadisticas
 * @desc    Obtener estadísticas del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/estadisticas',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getStats
);

export { router as caballoRoutes };