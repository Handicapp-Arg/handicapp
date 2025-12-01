// src/controllers/departamentoController.ts
import { Request, Response, NextFunction } from 'express';
import { DepartamentoService } from '../services/departamentoService';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../utils/errors';

export class DepartamentoController {
  
  /**
   * Get all departamentos
   * GET /api/v1/departamentos
   */
  static getDepartamentos = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const result = await DepartamentoService.getDepartamentos();
    
    if (!result.success || !result.data) {
      return ResponseHelper.internalError(res, 'Error al obtener departamentos');
    }

    return ResponseHelper.success(res, result.data, 'Departamentos obtenidos exitosamente');
  });

  /**
   * Get all puestos (optionally filtered by departamento)
   * GET /api/v1/puestos?departamento_id=1
   */
  static getPuestos = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const departamentoId = req.query['departamento_id'] ? parseInt(req.query['departamento_id'] as string, 10) : undefined;
    
    const result = await DepartamentoService.getPuestos(departamentoId);
    
    if (!result.success || !result.data) {
      return ResponseHelper.internalError(res, 'Error al obtener puestos');
    }

    return ResponseHelper.success(res, result.data, 'Puestos obtenidos exitosamente');
  });
}

export default DepartamentoController;
