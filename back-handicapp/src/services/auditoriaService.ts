import { Op, fn, col, literal } from 'sequelize';
import { Auditoria } from '../models/Auditoria';
import { User } from '../models/User';

export interface AuditoriaFilters {
  page?: number;
  limit?: number;
  accion?: string;
  entidad_tipo?: string;
  actor_usuario_id?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  search?: string;
}

export class AuditoriaService {
  static async getAuditorias(filters: AuditoriaFilters) {
    const { page = 1, limit = 50, accion, entidad_tipo, actor_usuario_id, fecha_inicio, fecha_fin, search } = filters;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (accion) where.accion = accion;
    if (entidad_tipo) where.entidad_tipo = entidad_tipo;
    if (actor_usuario_id) where.actor_usuario_id = actor_usuario_id;

    if (fecha_inicio || fecha_fin) {
      where.creado_el = {};
      if (fecha_inicio) where.creado_el[Op.gte] = new Date(fecha_inicio);
      if (fecha_fin) where.creado_el[Op.lte] = new Date(fecha_fin);
    }

    if (search) {
      where[Op.or] = [
        { accion: { [Op.iLike]: `%${search}%` } },
        { entidad_tipo: { [Op.iLike]: `%${search}%` } },
        { ip: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Auditoria.findAndCountAll({
      where,
      include: [{ model: User, as: 'actor_usuario', attributes: ['id', 'nombre', 'apellido', 'email'] }],
      order: [['creado_el', 'DESC']],
      limit,
      offset,
    });

    return { auditorias: rows, pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) } };
  }

  static async getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, last24hCount, last7daysCount, last30daysCount] = await Promise.all([
      Auditoria.count(),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last24h } } }),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last7days } } }),
      Auditoria.count({ where: { creado_el: { [Op.gte]: last30days } } }),
    ]);

    const topActions = await Auditoria.findAll({
      attributes: ['accion', [fn('COUNT', col('accion')), 'count']],
      group: ['accion'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const topUsers = await Auditoria.findAll({
      attributes: ['actor_usuario_id', [fn('COUNT', col('actor_usuario_id')), 'count']],
      include: [{ model: User, as: 'actor_usuario', attributes: ['nombre', 'apellido', 'email'] }],
      group: ['actor_usuario_id', 'actor_usuario.id', 'actor_usuario.nombre', 'actor_usuario.apellido', 'actor_usuario.email'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
    });

    const entityTypes = await Auditoria.findAll({
      attributes: ['entidad_tipo', [fn('COUNT', col('entidad_tipo')), 'count']],
      where: { entidad_tipo: { [Op.ne]: null } },
      group: ['entidad_tipo'],
      order: [[literal('count'), 'DESC']],
      raw: true,
    });

    return { total, last24h: last24hCount, last7days: last7daysCount, last30days: last30daysCount, topActions, topUsers, entityTypes };
  }

  static async getById(id: number) {
    return Auditoria.findByPk(id, {
      include: [{ model: User, as: 'actor_usuario', attributes: ['id', 'nombre', 'apellido', 'email'] }],
    });
  }

  static async getActions(): Promise<string[]> {
    const rows = await Auditoria.findAll({ attributes: ['accion'], group: ['accion'], order: [['accion', 'ASC']], raw: true });
    return rows.map((r: any) => r.accion);
  }

  static async getEntityTypes(): Promise<string[]> {
    const rows = await Auditoria.findAll({
      attributes: ['entidad_tipo'],
      where: { entidad_tipo: { [Op.ne]: null } },
      group: ['entidad_tipo'],
      order: [['entidad_tipo', 'ASC']],
      raw: true,
    });
    return rows.map((r: any) => r.entidad_tipo);
  }
}
