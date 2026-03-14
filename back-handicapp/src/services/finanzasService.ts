import { Op, QueryTypes } from 'sequelize';
import { Gasto } from '../models/Gasto';
import { sequelize } from '../config/database';

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

/**
 * Obtener estadísticas de gastos optimizado con una sola query
 * Calcula totales del mes actual y anterior en una sola consulta
 */
export async function getGastosStats(usuarioId: number, caballoIds: number[]) {
  try {
    if (!usuarioId && (!caballoIds || caballoIds.length === 0)) {
      return { 
        success: true, 
        data: { mesActual: 0, mesAnterior: 0, diferencia: 0, tipo: 'aumento' as const } 
      };
    }

    const ahora = new Date();
    
    // Calcular rangos de fechas
    const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMesActual = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59);

    // Una sola query con CASE para calcular ambos meses
    const result = await sequelize.query(`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN fecha >= :inicioMesActual AND fecha <= :finMesActual 
          THEN CAST(monto AS DECIMAL) 
          ELSE 0 
        END), 0) as mes_actual,
        COALESCE(SUM(CASE 
          WHEN fecha >= :inicioMesAnterior AND fecha <= :finMesAnterior 
          THEN CAST(monto AS DECIMAL) 
          ELSE 0 
        END), 0) as mes_anterior
      FROM gastos
      WHERE (usuario_id = :usuarioId ${caballoIds.length > 0 ? `OR caballo_id IN (:caballoIds)` : ''})
        AND fecha >= :inicioMesAnterior
    `, {
      replacements: {
        usuarioId,
        caballoIds: caballoIds.length > 0 ? caballoIds : [0],
        inicioMesActual: inicioMesActual.toISOString(),
        finMesActual: finMesActual.toISOString(),
        inicioMesAnterior: inicioMesAnterior.toISOString(),
        finMesAnterior: finMesAnterior.toISOString()
      },
      type: QueryTypes.SELECT
    });

    const stats = result[0] as any;
    const mesActual = parseFloat(stats.mes_actual) || 0;
    const mesAnterior = parseFloat(stats.mes_anterior) || 0;
    
    const diferencia = mesAnterior > 0 
      ? Math.abs(((mesActual - mesAnterior) / mesAnterior) * 100)
      : 0;
    
    return {
      success: true,
      data: {
        mesActual,
        mesAnterior,
        diferencia: parseFloat(diferencia.toFixed(2)),
        tipo: mesActual >= mesAnterior ? 'aumento' as const : 'disminucion' as const
      }
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de gastos:', error);
    return { 
      success: false, 
      error: 'Error al calcular estadísticas de gastos',
      data: { mesActual: 0, mesAnterior: 0, diferencia: 0, tipo: 'aumento' as const }
    };
  }
}
