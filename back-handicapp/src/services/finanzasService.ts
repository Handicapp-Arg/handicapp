import { Op } from 'sequelize';
import { Gasto } from '../models/Gasto';
import { ServiceResponse } from '../types';

export async function getFinanzasUsuarioYCaballos(usuarioId: number, caballoIds: number[]) {
  try {
    if (!usuarioId && (!caballoIds || caballoIds.length === 0)) {
      return { success: true, data: [] };
    }
    const where: any = {};
    if (caballoIds && caballoIds.length > 0) {
      where.caballo_id = { [Op.in]: caballoIds };
    }
    // Suponiendo que hay gastos generales del usuario
    where[Op.or] = [
      { usuario_id: usuarioId },
      { caballo_id: { [Op.in]: caballoIds } }
    ];
    const gastos = await Gasto.findAll({
      where,
      order: [['fecha', 'DESC']]
    });
    return { success: true, data: gastos };
  } catch (error) {
    return { success: false, error: 'Error al obtener finanzas del usuario y caballos' };
  }
}
