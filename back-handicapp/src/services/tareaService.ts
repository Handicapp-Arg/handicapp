// src/services/tareaService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Tareas
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Tarea } from '../models/Tarea';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
import { Caballo } from '../models/Caballo';
import { ServiceResponse, PaginationQuery } from '../types';
import { TipoTarea, EstadoTarea } from '../models/enums';

interface CreateTareaData {
  establecimiento_id: number;
  caballo_id?: number;
  tipo: TipoTarea;
  titulo: string;
  notas?: string;
  asignado_a_usuario_id?: number;
  fecha_vencimiento?: Date;
}

interface UpdateTareaData extends Partial<CreateTareaData> {
  estado?: EstadoTarea;
}

export class TareaService {
  // Obtener todas las tareas con filtros y paginación
  static async getAllTareas(filters: {
    page?: number;
    limit?: number;
    estado?: string;
    prioridad?: string;
    categoria?: string; // no model field now, kept for future
    asignadoAUsuarioId?: number;
    caballoId?: number;
    establecimientoId?: number;
    fechaVencimientoInicio?: string;
    fechaVencimientoFin?: string;
    usuarioId?: number;
    userRole?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ServiceResponse<{ tareas: Tarea[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        estado,
        prioridad,
        asignadoAUsuarioId,
        caballoId,
        establecimientoId,
        fechaVencimientoInicio,
        fechaVencimientoFin,
        sortBy = 'fecha_vencimiento',
        sortOrder = 'ASC',
        usuarioId,
        userRole,
      } = filters || ({} as any);

      const offset = (page - 1) * limit;
      const where: any = {};
      if (estado) where.estado = estado;
      if (prioridad) {
        // prioridad no está en el modelo; se puede mapear via notas o tipo si existiera
      }
      if (asignadoAUsuarioId) where.asignado_a_usuario_id = asignadoAUsuarioId;
      if (caballoId) where.caballo_id = caballoId;
      if (establecimientoId) where.establecimiento_id = establecimientoId;
      if (fechaVencimientoInicio || fechaVencimientoFin) {
        where.fecha_vencimiento = {};
        if (fechaVencimientoInicio) where.fecha_vencimiento[Op.gte] = new Date(fechaVencimientoInicio);
        if (fechaVencimientoFin) where.fecha_vencimiento[Op.lte] = new Date(fechaVencimientoFin);
      }

      // Control de acceso básico: si no es admin, mostrar tareas creadas o asignadas al usuario
      if (userRole && userRole !== 'admin' && usuarioId) {
        where[Op.or] = [
          { creado_por_usuario_id: usuarioId },
          { asignado_a_usuario_id: usuarioId },
        ];
      }

      const { count, rows } = await Tarea.findAndCountAll({
        where,
        include: [
          { model: User, as: 'asignado_a', attributes: ['id', 'nombre', 'apellido'], required: false },
          { model: User, as: 'creado_por', attributes: ['id', 'nombre', 'apellido'] },
          { model: Caballo, as: 'caballo', attributes: ['id', 'nombre', 'microchip'], required: false },
          { model: Establecimiento, as: 'establecimiento', attributes: ['id', 'nombre'] },
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);
      return { success: true, data: { tareas: rows, total: count, totalPages } };
    } catch (error) {
      return { success: false, error: 'Error al obtener tareas' };
    }
  }
  
  // Asignar tarea a usuario
  static async asignarTarea(
    tareaId: number,
    asignadoAUsuarioId: number,
    actorUserId: number,
    actorRole?: string,
    observaciones?: string
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      if (!tarea) {
        return { success: false, error: 'Tarea no encontrada' };
      }

      // Permisos: admin, capataz o creador pueden asignar
      const allowed = actorRole === 'admin' || actorRole === 'capataz' || tarea.creado_por_usuario_id === actorUserId;
      if (!allowed) {
        return { success: false, error: 'Sin permisos para asignar' };
      }

      // Validar usuario de destino
      const usuario = await User.findByPk(asignadoAUsuarioId);
      if (!usuario) {
        return { success: false, error: 'Usuario asignado no encontrado' };
      }

      const notas = observaciones
        ? `${tarea.notas ? tarea.notas + '\n' : ''}Asignada a usuario ${asignadoAUsuarioId} por ${actorUserId}: ${observaciones}`
        : tarea.notas;

      await tarea.update({ asignado_a_usuario_id: asignadoAUsuarioId, notas, actualizado_el: new Date() });
      return { success: true, data: tarea };
    } catch (error) {
      return { success: false, error: 'Error al asignar tarea' };
    }
  }

  // Completar tarea
  static async completarTarea(
    tareaId: number,
    observaciones: string | undefined,
    actorUserId: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      if (!tarea) {
        return { success: false, error: 'Tarea no encontrada' };
      }

      // Permisos: asignado o creador pueden completar
      if (tarea.creado_por_usuario_id !== actorUserId && tarea.asignado_a_usuario_id !== actorUserId) {
        return { success: false, error: 'Sin permisos para completar esta tarea' };
      }

      const notas = observaciones
        ? `${tarea.notas ? tarea.notas + '\n' : ''}Completada por ${actorUserId}: ${observaciones}`
        : tarea.notas;

      await tarea.update({ estado: EstadoTarea.done, notas, actualizado_el: new Date() });
      return { success: true, data: tarea };
    } catch (error) {
      return { success: false, error: 'Error al completar tarea' };
    }
  }

  // Obtener tareas del usuario (asignadas o creadas) con filtros simples
  static async getTareasUsuario(
    userId: number,
    estado?: string,
    _prioridad?: string,
    categoria?: string
  ): Promise<ServiceResponse<Tarea[]>> {
    try {
      const where: any = {
        [Op.or]: [
          { creado_por_usuario_id: userId },
          { asignado_a_usuario_id: userId },
        ],
      };

      if (estado) {
        const allowed = Object.values(EstadoTarea);
        if (allowed.includes(estado as EstadoTarea)) {
          where.estado = estado;
        }
      }

      if (categoria) {
        const allowedTipos = Object.values(TipoTarea);
        if (allowedTipos.includes(categoria as TipoTarea)) {
          where.tipo = categoria;
        }
      }

      const tareas = await Tarea.findAll({
        where,
        include: [
          { model: User, as: 'asignado_a', attributes: ['id', 'nombre', 'apellido'], required: false },
          { model: User, as: 'creado_por', attributes: ['id', 'nombre', 'apellido'] },
          { model: Caballo, as: 'caballo', attributes: ['id', 'nombre', 'microchip'], required: false },
          { model: Establecimiento, as: 'establecimiento', attributes: ['id', 'nombre'] },
        ],
        order: [['fecha_vencimiento', 'ASC']],
        limit: 100,
      });

      return { success: true, data: tareas };
    } catch (error) {
      return { success: false, error: 'Error al obtener tareas del usuario' };
    }
  }
  // Obtener tareas por establecimiento
  static async getTareasByEstablecimiento(
    establecimientoId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ tareas: Tarea[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_vencimiento',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Tarea.findAndCountAll({
        where: { establecimiento_id: establecimientoId },
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre', 'microchip'],
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
          tareas: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tareas del establecimiento',
      };
    }
  }

  // Obtener tareas asignadas a un usuario
  static async getTareasAsignadasByUser(
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ tareas: Tarea[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_vencimiento',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Tarea.findAndCountAll({
        where: { asignado_a_usuario_id: userId },
        include: [
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre', 'microchip'],
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
          tareas: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tareas asignadas',
      };
    }
  }

  // Obtener tareas por caballo
  static async getTareasByCaballo(
    caballoId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ tareas: Tarea[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_vencimiento',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Tarea.findAndCountAll({
        where: { caballo_id: caballoId },
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
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
          tareas: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tareas del caballo',
      };
    }
  }

  // Obtener tarea por ID
  static async getTareaById(
    tareaId: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId, {
        include: [
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
          },
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido', 'email'],
            required: false
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido', 'email']
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre', 'sexo', 'microchip'],
            required: false
          }
        ]
      });

      if (!tarea) {
        return {
          success: false,
          error: 'Tarea no encontrada',
        };
      }

      return {
        success: true,
        data: tarea,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tarea',
      };
    }
  }

  // Crear nueva tarea
  static async createTarea(
    data: CreateTareaData,
    creadoPorUserId: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      // Verificar que el establecimiento existe
      const establecimiento = await Establecimiento.findByPk(data.establecimiento_id);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Verificar que el caballo existe si se especifica
      if (data.caballo_id) {
        const caballo = await Caballo.findByPk(data.caballo_id);
        if (!caballo) {
          return {
            success: false,
            error: 'Caballo no encontrado',
          };
        }
      }

      // Verificar que el usuario asignado existe si se especifica
      if (data.asignado_a_usuario_id) {
        const usuario = await User.findByPk(data.asignado_a_usuario_id);
        if (!usuario) {
          return {
            success: false,
            error: 'Usuario asignado no encontrado',
          };
        }
      }

      const tarea = await Tarea.create({
        ...data,
        creado_por_usuario_id: creadoPorUserId,
        estado: EstadoTarea.open,
      });

      return {
        success: true,
        data: tarea,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear tarea',
      };
    }
  }

  // Actualizar tarea
  static async updateTarea(
    tareaId: number,
    data: UpdateTareaData,
    userId: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      
      if (!tarea) {
        return {
          success: false,
          error: 'Tarea no encontrada',
        };
      }

      // Verificar permisos: creador o asignado pueden modificar
      if (tarea.creado_por_usuario_id !== userId && tarea.asignado_a_usuario_id !== userId) {
        return {
          success: false,
          error: 'Sin permisos para modificar esta tarea',
        };
      }

      await tarea.update({
        ...data,
        actualizado_el: new Date(),
      });

      return {
        success: true,
        data: tarea,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar tarea',
      };
    }
  }

  // Eliminar (soft) tarea
  static async deleteTarea(
    tareaId: number,
    userId: number,
    userRole?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      if (!tarea) {
        return { success: false, error: 'Tarea no encontrada' };
      }
      // Permitir admin o creador eliminar
      if (userRole !== 'admin' && tarea.creado_por_usuario_id !== userId) {
        return { success: false, error: 'Sin permisos para eliminar' };
      }
      await tarea.update({ estado: EstadoTarea.cancelled, actualizado_el: new Date() });
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: 'Error al eliminar tarea' };
    }
  }

  // Cambiar estado de tarea
  static async cambiarEstadoTarea(
    tareaId: number,
    nuevoEstado: EstadoTarea,
    userId: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      
      if (!tarea) {
        return {
          success: false,
          error: 'Tarea no encontrada',
        };
      }

      // Verificar permisos: creador o asignado pueden cambiar estado
      if (tarea.creado_por_usuario_id !== userId && tarea.asignado_a_usuario_id !== userId) {
        return {
          success: false,
          error: 'Sin permisos para modificar esta tarea',
        };
      }

      await tarea.update({
        estado: nuevoEstado,
        actualizado_el: new Date(),
      });

      return {
        success: true,
        data: tarea,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cambiar estado de tarea',
      };
    }
  }

  // Buscar tareas
  static async searchTareas(
    query: string,
    establecimientoId?: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ tareas: Tarea[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'fecha_vencimiento',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const whereCondition: any = {
        [Op.or]: [
          { titulo: { [Op.iLike]: `%${query}%` } },
          { notas: { [Op.iLike]: `%${query}%` } },
        ],
      };

      if (establecimientoId) {
        whereCondition.establecimiento_id = establecimientoId;
      }

      const { count, rows } = await Tarea.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre'],
            required: false
          },
          {
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
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
          tareas: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en la búsqueda de tareas',
      };
    }
  }

  // Obtener tareas pendientes
  static async getTareasPendientes(
    establecimientoId?: number,
    userId?: number
  ): Promise<ServiceResponse<Tarea[]>> {
    try {
      const whereCondition: any = {
        estado: {
          [Op.in]: [EstadoTarea.open, EstadoTarea.in_progress]
        }
      };

      if (establecimientoId) {
        whereCondition.establecimiento_id = establecimientoId;
      }

      if (userId) {
        whereCondition.asignado_a_usuario_id = userId;
      }

      const tareas = await Tarea.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'asignado_a',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre'],
            required: false
          }
        ],
        order: [['fecha_vencimiento', 'ASC']],
        limit: 20
      });

      return {
        success: true,
        data: tareas,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener tareas pendientes',
      };
    }
  }

  // Obtener estadísticas de tareas
  static async getTareaStats(
    establecimientoId?: number,
    userId?: number
  ): Promise<ServiceResponse<{
    totalTareas: number;
    tareasAbiertas: number;
    tareasEnProgreso: number;
    tareasCompletadas: number;
    tareasCanceladas: number;
    tareasPorTipo: Record<string, number>;
  }>> {
    try {
      const whereCondition: any = {};

      if (establecimientoId) {
        whereCondition.establecimiento_id = establecimientoId;
      }

      if (userId) {
        whereCondition.asignado_a_usuario_id = userId;
      }

      const tareas = await Tarea.findAll({
        where: whereCondition,
        attributes: ['estado', 'tipo']
      });

      const stats = {
        totalTareas: tareas.length,
        tareasAbiertas: 0,
        tareasEnProgreso: 0,
        tareasCompletadas: 0,
        tareasCanceladas: 0,
        tareasPorTipo: {} as Record<string, number>,
      };

      tareas.forEach(tarea => {
        // Contar por estado
        switch (tarea.estado) {
          case EstadoTarea.open:
            stats.tareasAbiertas++;
            break;
          case EstadoTarea.in_progress:
            stats.tareasEnProgreso++;
            break;
          case EstadoTarea.done:
            stats.tareasCompletadas++;
            break;
          case EstadoTarea.cancelled:
            stats.tareasCanceladas++;
            break;
        }

        // Contar por tipo
        const tipo = tarea.tipo;
        stats.tareasPorTipo[tipo] = (stats.tareasPorTipo[tipo] || 0) + 1;
      });

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas de tareas',
      };
    }
  }
}