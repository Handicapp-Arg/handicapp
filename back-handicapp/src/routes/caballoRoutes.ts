// src/routes/caballoRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Caballos
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { CaballoController } from '../controllers/caballoController';
import { AdjuntoController } from '../controllers/adjuntoController';
import { QRCodeController } from '../controllers/qrCodeController';
import { requireAuth } from '../middleware/auth';
import { requireRole, requirePermission, auditAccess } from '../middleware/authorization';
import { caballoValidations, paramValidations } from '../middleware/validation';
import { uploader } from '../controllers/uploadController';

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
  uploader.single('foto'), // Aceptar imagen opcional del caballo (campo 'foto')
  caballoValidations.create,
  CaballoController.create
);

/**
 * @route   GET /api/v1/caballos/solicitudes-pendientes
 * @desc    Obtener solicitudes pendientes de asociación para el usuario actual
 * @access  Propietarios y Establecimientos
 */
router.get(
  '/solicitudes-pendientes',
  requireAuth,
  CaballoController.getSolicitudesPendientes
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
 * @desc    Obtener propietarios actuales del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/propietarios',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getPropietarios
);

/**
 * @route   GET /api/v1/caballos/:id/propietarios/historial
 * @desc    Obtener historial completo de propietarios (actuales + históricos)
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/propietarios/historial',
  paramValidations.id,
  requirePermission('horses:read'),
  CaballoController.getHistorialPropietarios
);

/**
 * @route   PATCH /api/v1/caballos/:id/propietarios/:propietarioId
 * @desc    Actualizar datos de propiedad (porcentaje, fechas, estado)
 * @access  Admin, Propietario actual del caballo
 */
router.patch(
  '/:id/propietarios/:propietarioId',
  paramValidations.id,
  requirePermission('horses:manage_owners'),
  CaballoController.updatePropietario
);

/**
 * @route   DELETE /api/v1/caballos/:id/propietarios/:propietarioId
 * @desc    Finalizar propiedad (marcar como histórico)
 * @access  Admin, Propietario actual del caballo
 */
router.delete(
  '/:id/propietarios/:propietarioId',
  paramValidations.id,
  requirePermission('horses:manage_owners'),
  CaballoController.removePropietario
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

// ====================================
// ADJUNTOS / DOCUMENTOS
// ====================================

/**
 * @route   GET /api/v1/caballos/:id/adjuntos
 * @desc    Obtener todos los adjuntos del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/adjuntos',
  paramValidations.id,
  requirePermission('horses:read'),
  AdjuntoController.getByCaballo
);

/**
 * @route   GET /api/v1/caballos/:id/adjuntos/estadisticas
 * @desc    Obtener estadísticas de adjuntos por categoría
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/adjuntos/estadisticas',
  paramValidations.id,
  requirePermission('horses:read'),
  AdjuntoController.getEstadisticas
);

// ====================================
// CÓDIGOS QR
// ====================================

/**
 * @route   GET /api/v1/caballos/:id/qr
 * @desc    Obtener o generar QR code para el caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/qr',
  paramValidations.id,
  requirePermission('horses:read'),
  QRCodeController.getOrCreate
);

/**
 * @route   GET /api/v1/caballos/:id/qr/todos
 * @desc    Obtener todos los QR codes del caballo
 * @access  Usuarios con acceso al caballo
 */
router.get(
  '/:id/qr/todos',
  paramValidations.id,
  requirePermission('horses:read'),
  QRCodeController.getAllByCaballo
);

export { router as caballoRoutes };