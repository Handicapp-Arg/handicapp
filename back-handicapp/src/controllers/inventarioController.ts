// src/controllers/inventarioController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { Producto, Categoria, Proveedor, Movimiento } from '../models/inventario';
import { MembresiaUsuarioEstablecimiento } from '../models/MembresiaUsuarioEstablecimiento';
import { Op } from 'sequelize';

export class InventarioController {

  /**
   * Helper para obtener el establecimiento del usuario
   */
  private static async getEstablecimientoId(usuarioId: number): Promise<number | null> {
    const membresia = await MembresiaUsuarioEstablecimiento.findOne({
      where: { usuario_id: usuarioId },
      order: [['creado_el', 'DESC']],
    });
    return membresia ? membresia.establecimiento_id : null;
  }

  // PRODUCTOS
  static async getProductos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { categoria_id, proveedor_id, estado, stock_bajo, busqueda } = req.query;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const where: any = { establecimiento_id: establecimientoId, eliminado_el: null };
      if (categoria_id) where.categoria_id = Number(categoria_id);
      if (proveedor_id) where.proveedor_id = Number(proveedor_id);
      if (estado) where.estado = estado;
      if (busqueda) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${busqueda}%` } },
          { codigo: { [Op.iLike]: `%${busqueda}%` } },
        ];
      }

      const productos = await Producto.findAll({
        where,
        include: [
          { association: 'categoria', attributes: ['id', 'nombre', 'color'] },
          { association: 'proveedor', attributes: ['id', 'nombre'] },
        ],
        order: [['nombre', 'ASC']],
      });

      let result = productos;
      if (stock_bajo === 'true') {
        result = productos.filter(p => p.stock_actual < p.stock_minimo);
      }

      logger.info(`✅ Productos obtenidos: ${result.length}`);
      res.json(ApiResponse.success(result));
    } catch (error) {
      logger.error('Error al obtener productos:', error);
      res.status(500).json(ApiResponse.error('Error al obtener productos'));
    }
  }

  static async getProducto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { id } = req.params;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const producto = await Producto.findOne({
        where: { id: Number(id), establecimiento_id: establecimientoId, eliminado_el: null },
        include: [{ association: 'categoria' }, { association: 'proveedor' }],
      });

      if (!producto) {
        res.status(404).json(ApiResponse.error('Producto no encontrado'));
        return;
      }

      res.json(ApiResponse.success(producto));
    } catch (error) {
      logger.error('Error al obtener producto:', error);
      res.status(500).json(ApiResponse.error('Error al obtener producto'));
    }
  }

  static async crearProducto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { codigo, nombre, descripcion, categoria_id, proveedor_id, unidad_medida, precio_unitario, stock_actual, stock_minimo, stock_maximo, imagen_url, notas } = req.body;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      if (!codigo || !nombre || !categoria_id) {
        res.status(400).json(ApiResponse.error('Código, nombre y categoría son requeridos'));
        return;
      }

      const existe = await Producto.findOne({ where: { codigo, establecimiento_id: establecimientoId } });
      if (existe) {
        res.status(400).json(ApiResponse.error('Ya existe un producto con ese código'));
        return;
      }

      const producto = await Producto.create({
        establecimiento_id: establecimientoId,
        codigo,
        nombre,
        descripcion: descripcion || null,
        categoria_id: Number(categoria_id),
        proveedor_id: proveedor_id ? Number(proveedor_id) : null,
        unidad_medida: unidad_medida || 'unidad',
        precio_unitario: Number(precio_unitario) || 0,
        stock_actual: Number(stock_actual) || 0,
        stock_minimo: Number(stock_minimo) || 0,
        stock_maximo: Number(stock_maximo) || 0,
        estado: 'activo',
        imagen_url: imagen_url || null,
        notas: notas || null,
        creado_el: new Date(),
      } as any);

      logger.info(`✅ Producto creado: ${producto.id} - ${producto.nombre}`);
      res.status(201).json(ApiResponse.success(producto));
    } catch (error) {
      logger.error('Error al crear producto:', error);
      res.status(500).json(ApiResponse.error('Error al crear producto'));
    }
  }

  static async actualizarProducto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { id } = req.params;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const producto = await Producto.findOne({
        where: { id: Number(id), establecimiento_id: establecimientoId, eliminado_el: null },
      });

      if (!producto) {
        res.status(404).json(ApiResponse.error('Producto no encontrado'));
        return;
      }

      const { codigo, nombre, descripcion, categoria_id, proveedor_id, unidad_medida, precio_unitario, stock_minimo, stock_maximo, estado, imagen_url, notas } = req.body;

      if (codigo && codigo !== producto.codigo) {
        const existe = await Producto.findOne({
          where: { codigo, establecimiento_id: establecimientoId, id: { [Op.ne]: Number(id) } },
        });
        if (existe) {
          res.status(400).json(ApiResponse.error('Ya existe otro producto con ese código'));
          return;
        }
      }

      await producto.update({
        codigo: codigo || producto.codigo,
        nombre: nombre || producto.nombre,
        descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
        categoria_id: categoria_id ? Number(categoria_id) : producto.categoria_id,
        proveedor_id: proveedor_id !== undefined ? (proveedor_id ? Number(proveedor_id) : null) : producto.proveedor_id,
        unidad_medida: unidad_medida || producto.unidad_medida,
        precio_unitario: precio_unitario !== undefined ? Number(precio_unitario) : producto.precio_unitario,
        stock_minimo: stock_minimo !== undefined ? Number(stock_minimo) : producto.stock_minimo,
        stock_maximo: stock_maximo !== undefined ? Number(stock_maximo) : producto.stock_maximo,
        estado: estado || producto.estado,
        imagen_url: imagen_url !== undefined ? imagen_url : producto.imagen_url,
        notas: notas !== undefined ? notas : producto.notas,
        actualizado_el: new Date(),
      });

      logger.info(`✅ Producto actualizado: ${producto.id}`);
      res.json(ApiResponse.success(producto));
    } catch (error) {
      logger.error('Error al actualizar producto:', error);
      res.status(500).json(ApiResponse.error('Error al actualizar producto'));
    }
  }

  static async eliminarProducto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { id } = req.params;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const producto = await Producto.findOne({
        where: { id: Number(id), establecimiento_id: establecimientoId, eliminado_el: null },
      });

      if (!producto) {
        res.status(404).json(ApiResponse.error('Producto no encontrado'));
        return;
      }

      await producto.update({ eliminado_el: new Date() });
      logger.info(`✅ Producto eliminado: ${producto.id}`);
      res.json(ApiResponse.success({ message: 'Producto eliminado correctamente' }));
    } catch (error) {
      logger.error('Error al eliminar producto:', error);
      res.status(500).json(ApiResponse.error('Error al eliminar producto'));
    }
  }

  // MOVIMIENTOS
  static async getMovimientos(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { producto_id, tipo, fecha_desde, fecha_hasta } = req.query;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const where: any = {};
      if (producto_id) where.producto_id = Number(producto_id);
      if (tipo) where.tipo = tipo;
      if (fecha_desde || fecha_hasta) {
        where.creado_el = {};
        if (fecha_desde) where.creado_el[Op.gte] = new Date(fecha_desde as string);
        if (fecha_hasta) where.creado_el[Op.lte] = new Date(fecha_hasta as string);
      }

      const movimientos = await Movimiento.findAll({
        where,
        include: [{
          association: 'producto',
          where: { establecimiento_id: establecimientoId },
          attributes: ['id', 'nombre', 'codigo', 'unidad_medida'],
        }],
        order: [['creado_el', 'DESC']],
        limit: 100,
      });

      res.json(ApiResponse.success(movimientos));
    } catch (error) {
      logger.error('Error al obtener movimientos:', error);
      res.status(500).json(ApiResponse.error('Error al obtener movimientos'));
    }
  }

  static async crearMovimiento(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;
      const { producto_id, tipo, cantidad, precio_unitario, motivo, referencia } = req.body;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      if (!producto_id || !tipo || !cantidad) {
        res.status(400).json(ApiResponse.error('Producto, tipo y cantidad son requeridos'));
        return;
      }

      if (!['entrada', 'salida', 'ajuste'].includes(tipo)) {
        res.status(400).json(ApiResponse.error('Tipo de movimiento inválido'));
        return;
      }

      const producto = await Producto.findOne({
        where: { id: Number(producto_id), establecimiento_id: establecimientoId, eliminado_el: null },
      });

      if (!producto) {
        res.status(404).json(ApiResponse.error('Producto no encontrado'));
        return;
      }

      const cantidadNum = Number(cantidad);
      const stockAnterior = producto.stock_actual;
      let stockNuevo = stockAnterior;

      switch (tipo) {
        case 'entrada':
          stockNuevo = stockAnterior + cantidadNum;
          break;
        case 'salida':
          if (stockAnterior < cantidadNum) {
            res.status(400).json(ApiResponse.error('Stock insuficiente'));
            return;
          }
          stockNuevo = stockAnterior - cantidadNum;
          break;
        case 'ajuste':
          stockNuevo = cantidadNum;
          break;
      }

      const movimiento = await Movimiento.create({
        producto_id: Number(producto_id),
        tipo,
        cantidad: tipo === 'ajuste' ? Math.abs(stockNuevo - stockAnterior) : cantidadNum,
        precio_unitario: precio_unitario ? Number(precio_unitario) : null,
        motivo: motivo || null,
        referencia: referencia || null,
        usuario_id: usuario.id,
        stock_anterior: stockAnterior,
        stock_nuevo: stockNuevo,
        creado_el: new Date(),
      } as any);

      await producto.update({ stock_actual: stockNuevo, actualizado_el: new Date() });

      logger.info(`✅ Movimiento creado: ${tipo} de ${cantidad} unidades para producto ${producto_id}`);
      res.status(201).json(ApiResponse.success(movimiento));
    } catch (error) {
      logger.error('Error al crear movimiento:', error);
      res.status(500).json(ApiResponse.error('Error al crear movimiento'));
    }
  }

  // CATEGORÍAS
  static async getCategorias(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
      res.json(ApiResponse.success(categorias));
    } catch (error) {
      logger.error('Error al obtener categorías:', error);
      res.status(500).json(ApiResponse.error('Error al obtener categorías'));
    }
  }

  // PROVEEDORES
  static async getProveedores(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const proveedores = await Proveedor.findAll({ order: [['nombre', 'ASC']] });
      res.json(ApiResponse.success(proveedores));
    } catch (error) {
      logger.error('Error al obtener proveedores:', error);
      res.status(500).json(ApiResponse.error('Error al obtener proveedores'));
    }
  }

  // ESTADÍSTICAS
  static async getEstadisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuario = req.user!;

      const establecimientoId = await InventarioController.getEstablecimientoId(usuario.id);
      if (!establecimientoId) {
        res.status(403).json(ApiResponse.error('Usuario no asociado a un establecimiento'));
        return;
      }

      const productos = await Producto.findAll({
        where: { establecimiento_id: establecimientoId, eliminado_el: null },
      });

      const totalProductos = productos.length;
      const productosActivos = productos.filter(p => p.estado === 'activo').length;
      const productosBajoStock = productos.filter(p => p.stock_actual < p.stock_minimo).length;
      const valorTotal = productos.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);

      const estadisticas = {
        total_productos: totalProductos,
        productos_activos: productosActivos,
        productos_bajo_stock: productosBajoStock,
        valor_inventario: valorTotal,
      };

      res.json(ApiResponse.success(estadisticas));
    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      res.status(500).json(ApiResponse.error('Error al obtener estadísticas'));
    }
  }
}
