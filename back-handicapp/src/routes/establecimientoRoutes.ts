// src/routes/establecimientoRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Establecimientos
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { param } from 'express-validator';
import { EstablecimientoController } from '../controllers/establecimientoController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { establecimientoValidations, paramValidations, handleValidationErrors } from '../middleware/validation';

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
 * @route   POST /api/v1/establecimientos
 * @desc    Crear nuevo establecimiento
 * @access  Admin, Establecimiento
 */
router.post(
  '/',
  requireRole('admin', 'establecimiento'),
  establecimientoValidations.create,
  EstablecimientoController.create
);

/**
 * @route   GET /api/v1/establecimientos
 * @desc    Obtener todos los establecimientos con paginación
 * @access  Todos los autenticados
 */
router.get(
  '/',
  paramValidations.pagination,
  EstablecimientoController.getAll
);

/**
 * @route   GET /api/v1/establecimientos/:id
 * @desc    Obtener establecimiento por ID
 * @access  Usuarios con acceso al establecimiento
 */
router.get(
  '/:id',
  paramValidations.id,
  EstablecimientoController.getById
);

/**
 * @route   PUT /api/v1/establecimientos/:id
 * @desc    Actualizar establecimiento
 * @access  Admin, Propietario del establecimiento
 */
router.put(
  '/:id',
  paramValidations.id,
  requirePermission('establishments:write'),
  establecimientoValidations.update,
  EstablecimientoController.update
);

/**
 * @route   DELETE /api/v1/establecimientos/:id
 * @desc    Eliminar establecimiento (soft delete)
 * @access  Admin únicamente
 */
router.delete(
  '/:id',
  paramValidations.id,
  requireRole('admin'),
  EstablecimientoController.delete
);

// ====================================
// GESTIÓN DE USUARIOS
// ====================================

/**
 * @route   POST /api/v1/establecimientos/:id/usuarios
 * @desc    Agregar usuario al establecimiento
 * @access  Admin, Propietario del establecimiento
 */
router.post(
  '/:id/usuarios',
  paramValidations.id,
  requirePermission('establishments:manage_users'),
  establecimientoValidations.addUser,
  EstablecimientoController.addUser
);

/**
 * @route   GET /api/v1/establecimientos/:id/usuarios
 * @desc    Obtener usuarios del establecimiento
 * @access  Usuarios con acceso al establecimiento
 */
router.get(
  '/:id/usuarios',
  paramValidations.id,
  requirePermission('establishments:read'),
  EstablecimientoController.getUsers
);

/**
 * @route   DELETE /api/v1/establecimientos/:id/usuarios/:userId
 * @desc    Remover usuario del establecimiento
 * @access  Admin, Propietario del establecimiento
 */
router.delete(
  '/:id/usuarios/:userId',
  [
    param('id').isInt({ min: 1 }).withMessage('ID debe ser un número entero positivo'),
    param('userId').isInt({ min: 1 }).withMessage('User ID debe ser un número entero positivo'),
    handleValidationErrors
  ],
  requirePermission('establishments:manage_users'),
  EstablecimientoController.removeUser
);

// ====================================
// CABALLOS DEL ESTABLECIMIENTO
// ====================================

/**
 * @route   GET /api/v1/establecimientos/:id/caballos
 * @desc    Obtener caballos del establecimiento
 * @access  Usuarios con acceso al establecimiento
 */
router.get(
  '/:id/caballos',
  paramValidations.id,
  requirePermission('horses:read'),
  EstablecimientoController.getCaballos
);

// ====================================
// ESTADÍSTICAS
// ====================================

/**
 * @route   GET /api/v1/establecimientos/:id/estadisticas
 * @desc    Obtener estadísticas del establecimiento
 * @access  Admin, Propietario del establecimiento
 */
router.get(
  '/:id/estadisticas',
  paramValidations.id,
  requirePermission('establishments:view_stats'),
  EstablecimientoController.getStats
);

export { router as establecimientoRoutes };