import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';
import { AuditoriaService } from '../services/auditoriaService';

export class AuditoriaController {
  static getAuditorias = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { page, limit, accion, entidad_tipo, actor_usuario_id, fecha_inicio, fecha_fin, search } = req.query;

    const data = await AuditoriaService.getAuditorias({
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
      ...(accion ? { accion: accion as string } : {}),
      ...(entidad_tipo ? { entidad_tipo: entidad_tipo as string } : {}),
      ...(actor_usuario_id ? { actor_usuario_id: parseInt(actor_usuario_id as string, 10) } : {}),
      ...(fecha_inicio ? { fecha_inicio: fecha_inicio as string } : {}),
      ...(fecha_fin ? { fecha_fin: fecha_fin as string } : {}),
      ...(search ? { search: search as string } : {}),
    });

    return ResponseHelper.success(res, data, 'Logs de auditoría obtenidos');
  });

  static getStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const data = await AuditoriaService.getStats();
    return ResponseHelper.success(res, data, 'Estadísticas de auditoría obtenidas');
  });

  static getAuditoriaById = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    if (!id) return ResponseHelper.badRequest(res, 'ID de auditoría requerido');

    const auditoria = await AuditoriaService.getById(parseInt(id, 10));
    if (!auditoria) return ResponseHelper.notFound(res, 'Log de auditoría no encontrado');

    return ResponseHelper.success(res, auditoria, 'Log de auditoría obtenido');
  });

  static getActions = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const actions = await AuditoriaService.getActions();
    return ResponseHelper.success(res, actions, 'Acciones obtenidas');
  });

  static getEntityTypes = asyncHandler(async (_req: AuthenticatedRequest, res: Response, _next: NextFunction) => {
    const types = await AuditoriaService.getEntityTypes();
    return ResponseHelper.success(res, types, 'Tipos de entidad obtenidos');
  });
}
