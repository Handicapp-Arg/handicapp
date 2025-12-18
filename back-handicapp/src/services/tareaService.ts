// src/services/tareaService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Tareas
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Tarea } from '../models/Tarea';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { Establecimiento } from '../models/Establecimiento';
import { Caballo } from '../models/Caballo';
import { PropietarioCaballo } from '../models/PropietarioCaballo';
import { Evento } from '../models/Evento';
import { TipoEvento } from '../models/TipoEvento';
import { ServiceResponse, PaginationQuery } from '../types';
import { TipoTarea, EstadoTarea, EstadoValidacionEvento } from '../models/enums';
import { logger } from '../utils/logger';
import { TareaEventoMapper } from './tareaEventoMapper';


interface CreateTareaData {
  establecimiento_id: number;
  caballo_id?: number;
  tipo: TipoTarea;
  titulo: string;
  notas?: string;
  asignado_a_usuario_id?: number;
  fecha_vencimiento?: Date;
  prioridad?: string;
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

      // Control de acceso por rol
      
      if (userRole === 'admin') {
        // ADMIN: Ve todas las tareas sin restricciones
        
      } else if (userRole === 'establecimiento' && usuarioId) {
        // ESTABLECIMIENTO: Solo ve tareas de su establecimiento o creadas/asignadas a él
        const usuario = await User.findByPk(usuarioId, {
          attributes: ['establecimiento_id']
        });
        
        const userEstablecimientoId = usuario?.establecimiento_id;
        
        if (userEstablecimientoId) {
          // Ve tareas de su establecimiento O creadas por él O asignadas a él
          where[Op.or] = [
            { establecimiento_id: userEstablecimientoId },
            { creado_por_usuario_id: usuarioId },
            { asignado_a_usuario_id: usuarioId },
          ];
        } else {
          // Si no tiene establecimiento asignado, solo ve las que creó o le asignaron
          where[Op.or] = [
            { creado_por_usuario_id: usuarioId },
            { asignado_a_usuario_id: usuarioId },
          ];
        }
        
      } else if (userRole === 'capataz' && usuarioId) {
        // CAPATAZ: Ve tareas de su establecimiento o creadas/asignadas a él
        const usuario = await User.findByPk(usuarioId, {
          attributes: ['establecimiento_id']
        });
        
        const userEstablecimientoId = usuario?.establecimiento_id;
        
        if (userEstablecimientoId) {
          where[Op.or] = [
            { establecimiento_id: userEstablecimientoId },
            { creado_por_usuario_id: usuarioId },
            { asignado_a_usuario_id: usuarioId },
          ];
        } else {
          where[Op.or] = [
            { creado_por_usuario_id: usuarioId },
            { asignado_a_usuario_id: usuarioId },
          ];
        }
        
      } else if (userRole === 'propietario' && usuarioId) {
        // PROPIETARIO: Solo ve tareas de SUS caballos
        const caballosDelPropietario = await PropietarioCaballo.findAll({
          where: { propietario_usuario_id: usuarioId },
          attributes: ['caballo_id'],
        });
        
        const caballoIds = caballosDelPropietario.map(p => p.caballo_id);
        
        if (caballoIds.length === 0) {
          // Si no tiene caballos, no ve ninguna tarea
          return {
            success: true,
            data: { tareas: [], total: 0, totalPages: 0 },
          };
        }
        
        // Solo tareas que tienen caballo_id y pertenecen al propietario
        where.caballo_id = { [Op.in]: caballoIds };
        
      } else if (userRole && usuarioId) {
        // EMPLEADO/VETERINARIO: Ve tareas asignadas o creadas por él
        where[Op.or] = [
          { creado_por_usuario_id: usuarioId },
          { asignado_a_usuario_id: usuarioId },
        ];
      }

      // 🚀 OPTIMIZACIÓN: subQuery: false previene subqueries ineficientes
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
        subQuery: false, // ← Previene subqueries ineficientes
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

      // Permisos: solo admin puede asignar cualquier tarea, otros roles solo las que crearon
      const allowed = actorRole === 'admin' || tarea.creado_por_usuario_id === actorUserId;
      if (!allowed) {
        return { success: false, error: 'Sin permisos para asignar esta tarea' };
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

      // Actualizar el estado de la tarea
      await tarea.update({ estado: EstadoTarea.done, notas, actualizado_el: new Date() });

      // ============================================================================
      // 🎯 AUTO-GENERACIÓN DE EVENTO (Si la tarea está vinculada a un caballo)
      // ============================================================================
      if (tarea.caballo_id && TareaEventoMapper.debeGenerarEvento(tarea.tipo, tarea.caballo_id)) {
        try {
          logger.info(`🔄 Generando evento automático para tarea completada ID: ${tarea.id}`);

          // Obtener el tipo de evento correspondiente
          const tipoEventoId = await TareaEventoMapper.obtenerTipoEventoId(tarea.tipo);

          if (tipoEventoId) {
            // Obtener información del usuario que completa (para rol_autor)
            const usuario = await User.findByPk(actorUserId, {
              include: [{ model: Role, as: 'rol', attributes: ['nombre'] }]
            });

            const rolAutor = usuario?.rol?.nombre || 'establecimiento';

            // Crear el evento automáticamente
            const evento = await Evento.create({
              caballo_id: tarea.caballo_id,
              tipo_evento_id: tipoEventoId,
              fecha_evento: new Date(), // Fecha de completado
              titulo: tarea.titulo,
              descripcion: TareaEventoMapper.generarDescripcionEvento({
                titulo: tarea.titulo,
                notas: tarea.notas,
                tipo: tarea.tipo,
                asignado_a_usuario_id: tarea.asignado_a_usuario_id
              }),
              establecimiento_id: tarea.establecimiento_id,
              creado_por_usuario_id: actorUserId,
              rol_autor: rolAutor,
              estado: 'completado',
              prioridad: TareaEventoMapper.mapearPrioridad(tarea.prioridad),
              es_publico: true, // ✅ Visible para el propietario
              requiere_validacion: false,
              estado_validacion: EstadoValidacionEvento.approved,
              originado_de_tarea_id: tarea.id
            });

            // Vincular la tarea con el evento generado
            await tarea.update({ evento_generado_id: evento.id });

            logger.info(`✅ Evento automático creado: ID ${evento.id} para tarea ${tarea.id}`);
            
            // TODO: Enviar notificación al propietario del caballo
            // await NotificacionService.notificarNuevoEvento(tarea.caballo_id, evento.id);
          } else {
            logger.warn(`⚠️ No se pudo obtener tipo de evento para tarea tipo: ${tarea.tipo}`);
          }
        } catch (eventoError) {
          // No fallar la completación de la tarea si falla la creación del evento
          logger.error('❌ Error al generar evento automático:', eventoError);
          logger.info('✅ Tarea completada exitosamente (sin evento automático)');
        }
      }

      return { success: true, data: tarea };
    } catch (error) {
      logger.error('❌ Error al completar tarea:', error);
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
      // Verificar que el establecimiento existe (solo si se especifica)
      if (data.establecimiento_id) {
        const establecimiento = await Establecimiento.findByPk(data.establecimiento_id);
        if (!establecimiento) {
          return {
            success: false,
            error: 'Establecimiento no encontrado',
          };
        }
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
    userId: number,
    userRole?: string,
    userEstablecimientoId?: number
  ): Promise<ServiceResponse<Tarea>> {
    try {
      // Usar raw: true para evitar problemas con TypeScript public class fields
      const tareaRaw: any = await Tarea.findByPk(tareaId, { raw: true });
      
      if (!tareaRaw) {
        return {
          success: false,
          error: 'Tarea no encontrada',
        };
      }

      // Verificar permisos:
      // 1. Admin puede editar todo
      // 2. Creador puede editar
      // 3. Usuario asignado puede editar
      // 4. Establecimiento o capataz del mismo establecimiento puede editar
      const esCreador = tareaRaw.creado_por_usuario_id === userId;
      const esAsignado = tareaRaw.asignado_a_usuario_id === userId;
      const esAdmin = userRole === 'admin';
      const esDelMismoEstablecimiento = userEstablecimientoId && 
                                         tareaRaw.establecimiento_id === userEstablecimientoId &&
                                         (userRole === 'establecimiento' || userRole === 'capataz');

      const tienePermiso = esAdmin || esCreador || esAsignado || esDelMismoEstablecimiento;

      if (!tienePermiso) {
        return {
          success: false,
          error: 'Sin permisos para modificar esta tarea',
        };
      }

      // Ahora sí cargar la instancia del modelo para poder actualizar
      const tarea = await Tarea.findByPk(tareaId);
      if (!tarea) {
        return {
          success: false,
          error: 'Tarea no encontrada',
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
    userId: number,
    userRole?: string
  ): Promise<ServiceResponse<Tarea>> {
    try {
      const tarea = await Tarea.findByPk(tareaId);
      
      if (!tarea) {
        logger.warn(`Tarea ${tareaId} no encontrada`);
        return {
          success: false,
          error: 'Tarea no encontrada',
        };
      }

      // Admin puede cambiar cualquier tarea
      const isAdmin = userRole === 'admin';
      const isCreator = tarea.creado_por_usuario_id === userId;
      const isAssigned = tarea.asignado_a_usuario_id === userId;

      // Verificar permisos: admin, creador o asignado pueden cambiar estado
      logger.info('Verificando permisos cambio estado', {
        tareaId,
        userId,
        userRole,
        creador: tarea.creado_por_usuario_id,
        asignado: tarea.asignado_a_usuario_id,
        isAdmin,
        isCreator,
        isAssigned
      });

      if (!isAdmin && !isCreator && !isAssigned) {
        logger.warn(`Usuario ${userId} sin permisos para modificar tarea ${tareaId}`);
        return {
          success: false,
          error: 'Sin permisos para modificar esta tarea',
        };
      }

      await tarea.update({
        estado: nuevoEstado,
        actualizado_el: new Date(),
      });

      logger.info(`Estado de tarea ${tareaId} cambiado a ${nuevoEstado} por usuario ${userId}`);

      return {
        success: true,
        data: tarea,
      };
    } catch (error) {
      logger.error('Error al cambiar estado de tarea', { error, tareaId, userId });
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

  /**
   * Crear un evento a partir de una tarea completada
   * Mapea los campos de la tarea al formato de evento
   */
  static async crearEventoDesdeTarea(
    tareaId: number,
    usuarioId: number,
    datosAdicionales?: {
      costo_monto?: string;
      costo_moneda?: string;
      hora_inicio?: string;
      hora_fin?: string;
      ubicacion?: string;
      resultado?: string;
    }
  ): Promise<ServiceResponse<any>> {
    try {
      // 1. Obtener la tarea
      const tarea = await Tarea.findByPk(tareaId, {
        include: [
          { model: Caballo, as: 'caballo', required: false },
        ]
      });

      if (!tarea) {
        return { success: false, error: 'Tarea no encontrada' };
      }

      // 2. Validar que la tarea tenga caballo asociado (los eventos requieren caballo)
      if (!tarea.caballo_id) {
        return { 
          success: false, 
          error: 'La tarea debe estar asociada a un caballo para crear un evento' 
        };
      }

      // 3. Mapear tipo de tarea a tipo de evento (buscar en tipos_evento)
      const tipoEventoMap: Record<string, string> = {
        'salud': 'consulta_veterinaria',
        'entrenamiento': 'entrenamiento',
        'ejercicio': 'ejercicio',
        'alimentacion': 'alimentacion',
        'aseo_caballo': 'aseo',
      };

      const claveEvento = tipoEventoMap[tarea.tipo] || 'otro';
      
      const tipoEvento = await TipoEvento.findOne({ 
        where: { clave: claveEvento } 
      });

      if (!tipoEvento) {
        return { 
          success: false, 
          error: `No se encontró tipo de evento para "${claveEvento}"` 
        };
      }

      // 4. Crear el evento con datos de la tarea
      const eventoData = {
        caballo_id: tarea.caballo_id,
        tipo_evento_id: tipoEvento.id,
        fecha_evento: tarea.fecha_vencimiento || new Date(),
        titulo: tarea.titulo,
        descripcion: tarea.notas || tarea.titulo,
        establecimiento_id: tarea.establecimiento_id,
        creado_por_usuario_id: usuarioId,
        rol_autor: null, // se puede obtener del usuario si es necesario
        estado_validacion: EstadoValidacionEvento.approved,
        estado: 'completado',
        es_publico: false,
        requiere_validacion: false,
        // Datos adicionales opcionales
        costo_monto: datosAdicionales?.costo_monto || null,
        costo_moneda: datosAdicionales?.costo_moneda || 'ARS',
        hora_inicio: datosAdicionales?.hora_inicio || null,
        hora_fin: datosAdicionales?.hora_fin || null,
        ubicacion: datosAdicionales?.ubicacion || null,
      };

      const evento = await Evento.create(eventoData as any);

      // 5. Cargar relaciones para retornar objeto completo
      const eventoCompleto = await Evento.findByPk(evento.id, {
        include: [
          { model: Caballo, as: 'caballo', attributes: ['id', 'nombre', 'raza', 'sexo'] },
          { model: TipoEvento, as: 'tipo_evento', attributes: ['id', 'nombre', 'clave'] },
          { model: User, as: 'creado_por', attributes: ['id', 'nombre', 'apellido'] },
        ]
      });

      logger.info('Evento creado desde tarea', { 
        tareaId, 
        eventoId: evento.id, 
        usuarioId 
      });

      return {
        success: true,
        data: eventoCompleto,
        message: 'Evento creado exitosamente desde la tarea'
      };

    } catch (error) {
      logger.error('Error al crear evento desde tarea', { error, tareaId, usuarioId });
      return {
        success: false,
        error: 'Error al crear evento desde la tarea'
      };
    }
  }
}