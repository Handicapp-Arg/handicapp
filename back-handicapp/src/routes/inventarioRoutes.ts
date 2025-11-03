// src/routes/inventarioRoutes.ts
// -----------------------------------------------------------------------------
// HandicApp API - Rutas de Inventario
// -----------------------------------------------------------------------------

import { Router, type Router as ExpressRouter } from 'express';
import { InventarioController } from '../controllers/inventarioController';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';

const router: ExpressRouter = Router();

// ====================================
// MIDDLEWARE GLOBAL
// ====================================

// Todas las rutas requieren autenticación
router.use(requireAuth);

// Solo establecimientos pueden acceder al inventario
router.use(requireRole('establecimiento'));

// ====================================
// PRODUCTOS
// ====================================

/**
 * @route   GET /api/v1/establecimiento/inventario/productos
 * @desc    Obtener todos los productos del establecimiento
 * @access  Establecimiento
 */
router.get('/productos', InventarioController.getProductos);

/**
 * @route   GET /api/v1/establecimiento/inventario/productos/:id
 * @desc    Obtener un producto por ID
 * @access  Establecimiento
 */
router.get('/productos/:id', InventarioController.getProducto);

/**
 * @route   POST /api/v1/establecimiento/inventario/productos
 * @desc    Crear nuevo producto
 * @access  Establecimiento
 */
router.post('/productos', InventarioController.crearProducto);

/**
 * @route   PUT /api/v1/establecimiento/inventario/productos/:id
 * @desc    Actualizar producto
 * @access  Establecimiento
 */
router.put('/productos/:id', InventarioController.actualizarProducto);

/**
 * @route   DELETE /api/v1/establecimiento/inventario/productos/:id
 * @desc    Eliminar producto
 * @access  Establecimiento
 */
router.delete('/productos/:id', InventarioController.eliminarProducto);

// ====================================
// MOVIMIENTOS
// ====================================

/**
 * @route   GET /api/v1/establecimiento/inventario/movimientos
 * @desc    Obtener movimientos de inventario
 * @access  Establecimiento
 */
router.get('/movimientos', InventarioController.getMovimientos);

/**
 * @route   POST /api/v1/establecimiento/inventario/movimientos
 * @desc    Crear movimiento de inventario
 * @access  Establecimiento
 */
router.post('/movimientos', InventarioController.crearMovimiento);

// ====================================
// CATEGORÍAS
// ====================================

/**
 * @route   GET /api/v1/establecimiento/inventario/categorias
 * @desc    Obtener todas las categorías
 * @access  Establecimiento
 */
router.get('/categorias', InventarioController.getCategorias);

// ====================================
// PROVEEDORES
// ====================================

/**
 * @route   GET /api/v1/establecimiento/inventario/proveedores
 * @desc    Obtener todos los proveedores
 * @access  Establecimiento
 */
router.get('/proveedores', InventarioController.getProveedores);

// ====================================
// ESTADÍSTICAS
// ====================================

/**
 * @route   GET /api/v1/establecimiento/inventario/estadisticas
 * @desc    Obtener estadísticas del inventario
 * @access  Establecimiento
 */
router.get('/estadisticas', InventarioController.getEstadisticas);

export { router as inventarioRoutes };
