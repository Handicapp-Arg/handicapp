import { Adjunto } from '../models/Adjunto';
import { Caballo } from '../models/Caballo';
import { Evento } from '../models/Evento';
import { User } from '../models/User';
import { CategoriaAdjunto } from '../models/enums';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

interface CreateAdjuntoData {
  caballo_id?: number | undefined;
  evento_id?: number | undefined;
  subido_por_usuario_id: number;
  rol_autor?: string;
  categoria: CategoriaAdjunto;
  nombre_archivo: string;
  tipo_mime: string;
  tamanio_bytes?: bigint;
  ruta_almacenamiento: string;
}

export class AdjuntoService {
  /**
   * Obtener todos los adjuntos de un caballo
   */
  static async getAdjuntosByCaballo(caballoId: number): Promise<Adjunto[]> {
    logger.info('Obteniendo adjuntos por caballo', { caballoId });

    // Verificar que el caballo existe
    const caballo = await Caballo.findByPk(caballoId);
    if (!caballo) {
      throw new NotFoundError('Caballo no encontrado');
    }

    const adjuntos = await Adjunto.findAll({
      where: {
        caballo_id: caballoId,
        eliminado_el: null, // Solo adjuntos activos
      },
      include: [
        {
          model: User,
          as: 'subido_por',
          attributes: ['id', 'nombre', 'apellido', 'email'],
        },
      ],
      order: [['creado_el', 'DESC']],
    });

    logger.info('Adjuntos encontrados', { caballoId, count: adjuntos.length });
    return adjuntos;
  }

  /**
   * Obtener todos los adjuntos de un evento
   */
  static async getAdjuntosByEvento(eventoId: number): Promise<Adjunto[]> {
    logger.info('Obteniendo adjuntos por evento', { eventoId });

    // Verificar que el evento existe
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      throw new NotFoundError('Evento no encontrado');
    }

    const adjuntos = await Adjunto.findAll({
      where: {
        evento_id: eventoId,
        eliminado_el: null,
      },
      include: [
        {
          model: User,
          as: 'subido_por',
          attributes: ['id', 'nombre', 'apellido', 'email'],
        },
      ],
      order: [['creado_el', 'DESC']],
    });

    logger.info('Adjuntos encontrados', { eventoId, count: adjuntos.length });
    return adjuntos;
  }

  /**
   * Crear un nuevo adjunto
   */
  static async createAdjunto(data: CreateAdjuntoData): Promise<Adjunto> {
    logger.info('Creando adjunto', { data });

    // Validar que existe caballo o evento
    if (!data.caballo_id && !data.evento_id) {
      throw new ValidationError('Debe especificarse caballo_id o evento_id');
    }

    // Validar que existe el caballo si se especifica
    if (data.caballo_id) {
      const caballo = await Caballo.findByPk(data.caballo_id);
      if (!caballo) {
        throw new NotFoundError('Caballo no encontrado');
      }
    }

    // Validar que existe el evento si se especifica
    if (data.evento_id) {
      const evento = await Evento.findByPk(data.evento_id);
      if (!evento) {
        throw new NotFoundError('Evento no encontrado');
      }
    }

    // Crear el adjunto
    const adjunto = await Adjunto.create({
      caballo_id: data.caballo_id || null,
      evento_id: data.evento_id || null,
      subido_por_usuario_id: data.subido_por_usuario_id,
      rol_autor: data.rol_autor || null,
      categoria: data.categoria,
      nombre_archivo: data.nombre_archivo,
      tipo_mime: data.tipo_mime,
      tamanio_bytes: data.tamanio_bytes || null,
      ruta_almacenamiento: data.ruta_almacenamiento,
    });

    logger.info('Adjunto creado exitosamente', { adjuntoId: adjunto.id });
    return adjunto;
  }

  /**
   * Eliminar un adjunto (soft delete)
   */
  static async deleteAdjunto(adjuntoId: number, userId: number): Promise<void> {
    logger.info('Eliminando adjunto', { adjuntoId, userId });

    const adjunto = await Adjunto.findByPk(adjuntoId);
    if (!adjunto) {
      throw new NotFoundError('Adjunto no encontrado');
    }

    if (adjunto.eliminado_el) {
      throw new ValidationError('El adjunto ya fue eliminado');
    }

    // Soft delete
    adjunto.eliminado_el = new Date();
    await adjunto.save();

    logger.info('Adjunto eliminado exitosamente', { adjuntoId });
  }

  /**
   * Obtener la ruta completa de descarga de un adjunto
   */
  static async getDownloadUrl(adjuntoId: number): Promise<{ adjunto: Adjunto; filePath: string }> {
    logger.info('Obteniendo URL de descarga', { adjuntoId });

    const adjunto = await Adjunto.findByPk(adjuntoId);
    if (!adjunto) {
      throw new NotFoundError('Adjunto no encontrado');
    }

    if (adjunto.eliminado_el) {
      throw new ValidationError('El adjunto fue eliminado');
    }

    // Construir ruta absoluta del archivo
    const uploadDir = path.resolve(process.cwd(), config.upload.path);
    const filePath = path.join(uploadDir, adjunto.nombre_archivo);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      logger.error('Archivo no encontrado en disco', { filePath });
      throw new NotFoundError('Archivo no encontrado en el servidor');
    }

    return { adjunto, filePath };
  }

  /**
   * Obtener un adjunto por ID
   */
  static async getAdjuntoById(adjuntoId: number): Promise<Adjunto> {
    const adjunto = await Adjunto.findByPk(adjuntoId, {
      include: [
        {
          model: User,
          as: 'subidoPor',
          attributes: ['id', 'nombre', 'apellido', 'email'],
        },
      ],
    });

    if (!adjunto) {
      throw new NotFoundError('Adjunto no encontrado');
    }

    if (adjunto.eliminado_el) {
      throw new ValidationError('El adjunto fue eliminado');
    }

    return adjunto;
  }

  /**
   * Obtener estadísticas de adjuntos por categoría para un caballo
   */
  static async getEstadisticasByCaballo(caballoId: number): Promise<Record<string, number>> {
    const adjuntos = await this.getAdjuntosByCaballo(caballoId);

    const stats: Record<string, number> = {
      [CategoriaAdjunto.propietario]: 0,
      [CategoriaAdjunto.operativo]: 0,
      [CategoriaAdjunto.salud]: 0,
      [CategoriaAdjunto.otro]: 0,
    };

    adjuntos.forEach((adj) => {
      const categoria = adj.categoria;
      if (categoria && stats[categoria] !== undefined) {
        stats[categoria]++;
      }
    });

    return stats;
  }
}
