// src/services/eventoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Eventos
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Evento } from '../models/Evento';
import { TipoEvento } from '../models/TipoEvento';
import { Caballo } from '../models/Caballo';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
import { Adjunto } from '../models/Adjunto';
import { ServiceResponse, PaginationQuery } from '../types';
import { EstadoValidacionEvento } from '../models/enums';

interface CreateEventoData {
  caballo_id: number;
  tipo_evento_id: number;
  fecha_evento: Date;
  titulo?: string;
  descripcion?: string;
  establecimiento_id?: number;
  costo_monto?: string;
  costo_moneda?: string;
}

interface UpdateEventoData extends Partial<CreateEventoData> {
  estado_validacion?: EstadoValidacionEvento;
}

export class EventoService {
  
  // Obtener eventos por caballo
  static async getEventosByCaballo(
    caballoId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ eventos: Evento[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_evento',
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Evento.findAndCountAll({
        where: { 
          caballo_id: caballoId,
          eliminado_el: null 
        },
        include: [
          {
            model: TipoEvento,
            as: 'tipo_evento',
            attributes: ['id', 'nombre', 'clave', 'disciplina']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: User,
            as: 'validado_por',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre'],
            required: false
          },
          {
            model: Adjunto,
            as: 'adjuntos',
            attributes: ['id', 'nombre_archivo', 'tipo_mime', 'categoria'],
            required: false
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          eventos: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener eventos del caballo',
      };
    }
  }

  // Obtener eventos por establecimiento
  static async getEventosByEstablecimiento(
    establecimientoId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ eventos: Evento[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_evento',
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Evento.findAndCountAll({
        where: { 
          establecimiento_id: establecimientoId,
          eliminado_el: null 
        },
        include: [
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre', 'sexo', 'raza']
          },
          {
            model: TipoEvento,
            as: 'tipo_evento',
            attributes: ['id', 'nombre', 'clave', 'disciplina']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido']
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          eventos: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener eventos del establecimiento',
      };
    }
  }

  // Obtener evento por ID
  static async getEventoById(
    eventoId: number
  ): Promise<ServiceResponse<Evento>> {
    try {
      const evento = await Evento.findByPk(eventoId, {
        include: [
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre', 'sexo', 'raza', 'microchip']
          },
          {
            model: TipoEvento,
            as: 'tipo_evento',
            attributes: ['id', 'nombre', 'clave', 'disciplina']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: User,
            as: 'validado_por',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre', 'ciudad'],
            required: false
          },
          {
            model: Adjunto,
            as: 'adjuntos',
            where: { eliminado_el: null },
            required: false
          }
        ]
      });

      if (!evento) {
        return {
          success: false,
          error: 'Evento no encontrado',
        };
      }

      return {
        success: true,
        data: evento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener evento',
      };
    }
  }

  // Crear nuevo evento
  static async createEvento(
    data: CreateEventoData,
    creadoPorUserId: number,
    rolAutor?: string
  ): Promise<ServiceResponse<Evento>> {
    try {
      // Verificar que el caballo existe
      const caballo = await Caballo.findByPk(data.caballo_id);
      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // Verificar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(data.tipo_evento_id);
      if (!tipoEvento) {
        return {
          success: false,
          error: 'Tipo de evento no encontrado',
        };
      }

      const evento = await Evento.create({
        ...data,
        creado_por_usuario_id: creadoPorUserId,
        rol_autor: rolAutor,
        estado_validacion: EstadoValidacionEvento.approved, // Auto-aprobado por ahora
      });

      return {
        success: true,
        data: evento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear evento',
      };
    }
  }

  // Actualizar evento
  static async updateEvento(
    eventoId: number,
    data: UpdateEventoData,
    userId: number
  ): Promise<ServiceResponse<Evento>> {
    try {
      const evento = await Evento.findByPk(eventoId);
      
      if (!evento) {
        return {
          success: false,
          error: 'Evento no encontrado',
        };
      }

      // Verificar permisos: solo el creador puede modificar
      if (evento.creado_por_usuario_id !== userId) {
        return {
          success: false,
          error: 'Sin permisos para modificar este evento',
        };
      }

      await evento.update({
        ...data,
        actualizado_el: new Date(),
      });

      return {
        success: true,
        data: evento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar evento',
      };
    }
  }

  // Eliminar evento (soft delete)
  static async deleteEvento(
    eventoId: number,
    userId: number
  ): Promise<ServiceResponse<null>> {
    try {
      const evento = await Evento.findByPk(eventoId);
      
      if (!evento) {
        return {
          success: false,
          error: 'Evento no encontrado',
        };
      }

      // Verificar permisos: solo el creador puede eliminar
      if (evento.creado_por_usuario_id !== userId) {
        return {
          success: false,
          error: 'Sin permisos para eliminar este evento',
        };
      }

      await evento.update({
        eliminado_el: new Date(),
      });

      return {
        success: true,
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar evento',
      };
    }
  }

  // Buscar eventos
  static async searchEventos(
    query: string,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ eventos: Evento[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_evento',
        sortOrder = 'DESC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Evento.findAndCountAll({
        where: {
          eliminado_el: null,
          [Op.or]: [
            { titulo: { [Op.iLike]: `%${query}%` } },
            { descripcion: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre'],
            where: {
              nombre: { [Op.iLike]: `%${query}%` }
            },
            required: false
          },
          {
            model: TipoEvento,
            as: 'tipo_evento',
            attributes: ['id', 'nombre', 'clave']
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          eventos: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en la búsqueda de eventos',
      };
    }
  }

  // Obtener tipos de evento disponibles
  static async getTiposEvento(): Promise<ServiceResponse<TipoEvento[]>> {
    try {
      const tipos = await TipoEvento.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']],
        attributes: ['id', 'clave', 'nombre', 'disciplina']
      });

      return {
        success: true,
        data: tipos,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tipos de evento',
      };
    }
  }

  // Obtener estadísticas de eventos por caballo
  static async getEventoStatsByCaballo(
    caballoId: number
  ): Promise<ServiceResponse<{
    totalEventos: number;
    eventosPorTipo: Record<string, number>;
    ultimoEvento?: Date;
  }>> {
    try {
      const eventos = await Evento.findAll({
        where: { 
          caballo_id: caballoId,
          eliminado_el: null 
        },
        include: [{
          model: TipoEvento,
          as: 'tipo_evento',
          attributes: ['clave', 'nombre']
        }],
        order: [['fecha_evento', 'DESC']]
      });

      const stats = {
        totalEventos: eventos.length,
        eventosPorTipo: {} as Record<string, number>,
        ultimoEvento: eventos.length > 0 ? eventos[0].fecha_evento : undefined,
      };

      // Contar eventos por tipo
      eventos.forEach(evento => {
        const tipo = evento.tipo_evento?.clave || 'sin_tipo';
        stats.eventosPorTipo[tipo] = (stats.eventosPorTipo[tipo] || 0) + 1;
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas de eventos',
      };
    }
  }
}