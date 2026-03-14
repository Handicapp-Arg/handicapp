import { Op } from 'sequelize';
import { Evento } from '../models/Evento';
import { Caballo } from '../models/Caballo';
import { TipoEvento } from '../models/TipoEvento';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
export async function getEventosPorUsuarioYCaballos(usuarioId: number, caballoIds: number[], limit = 20) {
  try {
    if (!usuarioId && (!caballoIds || caballoIds.length === 0)) {
      return { success: true, data: [] };
    }
    const where: any = { eliminado_el: null };
    if (caballoIds && caballoIds.length > 0) {
      where.caballo_id = { [Op.in]: caballoIds };
    }
    // Opcional: podrías agregar eventos generales del usuario si aplica
    const eventos = await Evento.findAll({
      where,
      include: [
        { model: Caballo, as: 'caballo', attributes: ['id', 'nombre', 'raza', 'sexo'], required: false },
        { model: TipoEvento, as: 'tipo_evento', attributes: ['id', 'nombre', 'clave', 'disciplina'] },
        { model: User, as: 'creado_por', attributes: ['id', 'nombre', 'apellido'] },
        { model: User, as: 'validado_por', attributes: ['id', 'nombre', 'apellido'], required: false },
        { model: Establecimiento, as: 'establecimiento', attributes: ['id', 'nombre'], required: false },
      ],
      order: [['fecha_evento', 'DESC']],
      limit,
    });
    return { success: true, data: eventos };
  } catch (error) {
    return { success: false, error: 'Error al obtener eventos del usuario y caballos' };
  }
}
