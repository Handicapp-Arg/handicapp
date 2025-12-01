// src/services/departamentoService.ts
import { Departamento } from '../models/Departamento';
import { Puesto } from '../models/Puesto';
import { ServiceResponse } from '../types';

export class DepartamentoService {
  
  static async getDepartamentos(): Promise<ServiceResponse<Departamento[]>> {
    try {
      const departamentos = await Departamento.findAll({
        where: { activo: true },
        attributes: ['id', 'nombre', 'descripcion'],
        order: [['nombre', 'ASC']],
        include: [{
          model: Puesto,
          as: 'puestos',
          attributes: ['id', 'nombre'],
          where: { activo: true },
          required: false
        }]
      });

      return {
        success: true,
        data: departamentos as Departamento[],
      };
    } catch (error) {
      console.error('❌ Error fetching departamentos:', error);
      throw new Error('Failed to fetch departamentos');
    }
  }

  static async getPuestos(departamentoId?: number): Promise<ServiceResponse<Puesto[]>> {
    try {
      const whereClause: Record<string, unknown> = { activo: true };
      
      if (departamentoId) {
        whereClause['departamento_id'] = departamentoId;
      }

      const puestos = await Puesto.findAll({
        where: whereClause,
        attributes: ['id', 'nombre', 'descripcion', 'departamento_id'],
        order: [['nombre', 'ASC']],
        include: [{
          model: Departamento,
          as: 'departamento',
          attributes: ['id', 'nombre'],
        }]
      });

      return {
        success: true,
        data: puestos as Puesto[],
      };
    } catch (error) {
      console.error('❌ Error fetching puestos:', error);
      throw new Error('Failed to fetch puestos');
    }
  }
}

export default DepartamentoService;
