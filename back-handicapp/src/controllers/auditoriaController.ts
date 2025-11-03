import { Response, NextFunction } from 'express';
import { Auditoria } from '../models/Auditoria';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { Op } from 'sequelize';

export class AuditoriaController {
  /**
   * Get audit logs with filters
   * GET /api/v1/auditoria
   */
  static getAuditorias = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { 
      page = '1', 
      limit = '50',
      accion,
      entidad_tipo,
      actor_usuario_id,
      fecha_inicio,
      fecha_fin,
      search
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filters
    const where: any = {};

    if (accion) {
      where.accion = accion;
    }

    if (entidad_tipo) {
      where.entidad_tipo = entidad_tipo;
    }

    if (actor_usuario_id) {
      where.actor_usuario_id = parseInt(actor_usuario_id as string, 10);
    }

    if (fecha_inicio || fecha_fin) {
      where.creado_el = {};
      if (fecha_inicio) {
        where.creado_el[Op.gte] = new Date(fecha_inicio as string);
      }
      if (fecha_fin) {
        where.creado_el[Op.lte] = new Date(fecha_fin as string);
      }
    }

    if (search) {
      where[Op.or] = [
        { accion: { [Op.iLike]: `%${search}%` } },
        { entidad_tipo: { [Op.iLike]: `%${search}%` } },
        { ip: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Auditoria.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'actor_usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ],
      order: [['creado_el', 'DESC']],
      limit: limitNum,
      offset
    });

    return ResponseHelper.success(res, {
      auditorias: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum)
      }
    }, 'Logs de auditoría obtenidos');
  });

  /**
   * Get audit statistics
   * GET /api/v1/auditoria/stats
   */
  static getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, last24hCount, last7daysCount, last30daysCount] = await Promise.all([
      Auditoria.count(),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last24h } } }),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last7days } } }),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last30days } } })
    ]);

    // Top actions
    const topActions = await Auditoria.findAll({
      attributes: [
        'accion',
        [require('sequelize').fn('COUNT', require('sequelize').col('accion')), 'count']
      ],
      group: ['accion'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      limit: 10,
      raw: true
    });

    // Top users
    const topUsers = await Auditoria.findAll({
      attributes: [
        'actor_usuario_id',
        [require('sequelize').fn('COUNT', require('sequelize').col('actor_usuario_id')), 'count']
      ],
      include: [
        {
          model: User,
          as: 'actor_usuario',
          attributes: ['nombre', 'apellido', 'email']
        }
      ],
      group: ['actor_usuario_id', 'actor_usuario.id', 'actor_usuario.nombre', 'actor_usuario.apellido', 'actor_usuario.email'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      limit: 10
    });

    // Entity types distribution
    const entityTypes = await Auditoria.findAll({
      attributes: [
        'entidad_tipo',
        [require('sequelize').fn('COUNT', require('sequelize').col('entidad_tipo')), 'count']
      ],
      where: { entidad_tipo: { [Op.ne]: null } },
      group: ['entidad_tipo'],
      order: [[require('sequelize').literal('count'), 'DESC']],
      raw: true
    });

    return ResponseHelper.success(res, {
      total,
      last24h: last24hCount,
      last7days: last7daysCount,
      last30days: last30daysCount,
      topActions,
      topUsers,
      entityTypes
    }, 'Estadísticas de auditoría obtenidas');
  });

  /**
   * Get audit log by ID
   * GET /api/v1/auditoria/:id
   */
  static getAuditoriaById = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
      return ResponseHelper.badRequest(res, 'ID de auditoría requerido');
    }

    const auditoria = await Auditoria.findByPk(parseInt(id, 10), {
      include: [
        {
          model: User,
          as: 'actor_usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }
      ]
    });

    if (!auditoria) {
      return ResponseHelper.notFound(res, 'Log de auditoría no encontrado');
    }

    return ResponseHelper.success(res, auditoria, 'Log de auditoría obtenido');
  });

  /**
   * Get unique actions for filters
   * GET /api/v1/auditoria/actions
   */
  static getActions = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const actions = await Auditoria.findAll({
      attributes: ['accion'],
      group: ['accion'],
      order: [['accion', 'ASC']],
      raw: true
    });

    return ResponseHelper.success(res, actions.map(a => a.accion), 'Acciones obtenidas');
  });

  /**
   * Get unique entity types for filters
   * GET /api/v1/auditoria/entity-types
   */
  static getEntityTypes = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const types = await Auditoria.findAll({
      attributes: ['entidad_tipo'],
      where: { entidad_tipo: { [Op.ne]: null } },
      group: ['entidad_tipo'],
      order: [['entidad_tipo', 'ASC']],
      raw: true
    });

    return ResponseHelper.success(res, types.map(t => t.entidad_tipo), 'Tipos de entidad obtenidos');
  });
}
