// src/services/caballoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Caballos (LIMPIO)
// -----------------------------------------------------------------------------

import { Op, UniqueConstraintError, ValidationError, DatabaseError } from 'sequelize';
import { Caballo } from '../models/Caballo';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
import { PropietarioCaballo } from '../models/PropietarioCaballo';
import { CaballoEstablecimiento } from '../models/CaballoEstablecimiento';
import { MembresiaUsuarioEstablecimiento } from '../models/MembresiaUsuarioEstablecimiento';
import { Evento } from '../models/Evento';
import { TipoEvento } from '../models/TipoEvento';
import { ServiceResponse } from '../types';
import { 
  SexoCaballo, 
  Disciplina, 
  EstadoGlobalCaballo,
  EstadoAsociacionCE,
  EstadoMembresia
} from '../models/enums';
import { logger } from '../utils/logger';
import { sequelize } from '../config/database';

interface CreateCaballoData {
  nombre: string;
  sexo?: SexoCaballo;
  fecha_nacimiento?: Date;
  pelaje?: string;
  raza?: string;
  disciplina?: Disciplina;
  microchip?: string;
  foto_url?: string;
  padre_id?: number;
  madre_id?: number;
  establecimiento_id?: number;
  // Campos extendidos - Documentación oficial
  rp?: string;
  sba?: string;
  adn?: string;
  pasaporte?: string;
  numero_fei?: string;
  ueln?: string;
  // Campos extendidos - Datos físicos
  altura?: number;
  peso?: number;
  creadoPorUsuarioId: number;
}

interface UpdateCaballoData {
  nombre?: string;
  sexo?: SexoCaballo;
  fecha_nacimiento?: Date;
  pelaje?: string;
  raza?: string;
  disciplina?: Disciplina;
  microchip?: string;
  foto_url?: string;
  padre_id?: number;
  madre_id?: number;
  estado_global?: EstadoGlobalCaballo;
  // Campos extendidos - Documentación oficial
  rp?: string;
  sba?: string;
  adn?: string;
  pasaporte?: string;
  numero_fei?: string;
  ueln?: string;
  // Campos extendidos - Datos físicos
  altura?: number;
  peso?: number;
}

interface CaballoFilters {
  page?: number;
  limit?: number;
  search?: string;
  establecimientoId?: number;
  raza?: string;
  sexo?: string;
  usuarioId: number;
  userRole?: string;
}

export class CaballoService {

  /**
   * Crear nuevo caballo
   */
  static async createCaballo(data: CreateCaballoData): Promise<ServiceResponse<Caballo>> {
    try {
      // Ejecutar toda la creación dentro de una transacción para consistencia
      const result = await sequelize.transaction(async (t) => {
        // Crear caballo con estado activo por defecto
        const caballoData = {
          ...data,
          estado_global: EstadoGlobalCaballo.activo
        };

        const caballo = await Caballo.create(caballoData, { transaction: t, returning: true });
        
        // Sequelize en autoIncrement puede devolver el id en diferentes propiedades según el driver
        const caballoId = caballo.id || (caballo as any).dataValues?.id || (caballo.get('id') as number);
        
        logger.debug('Caballo.create result', { 
          id: caballoId, 
          nombre: caballo.nombre,
          hasDataValues: !!(caballo as any).dataValues,
          directId: caballo.id,
          dataValuesId: (caballo as any).dataValues?.id
        });

        if (!caballoId || Number.isNaN(Number(caballoId))) {
          throw new Error('No se pudo generar el ID del caballo tras la creación');
        }

        await PropietarioCaballo.create({
          caballo_id: caballoId,
          propietario_usuario_id: data.creadoPorUsuarioId,
          fecha_inicio: new Date(),
          porcentaje_tenencia: 100,
          actual: true
        }, { transaction: t });

        // Si hay establecimiento, crear asociación
        if (data.establecimiento_id) {
          await CaballoEstablecimiento.create({
            caballo_id: caballoId,
            establecimiento_id: data.establecimiento_id,
            fecha_inicio: new Date(),
            estado_asociacion: EstadoAsociacionCE.accepted
          }, { transaction: t });
        }

        // Recargar con asociaciones (no requeridas para evitar fallo si alguna falta)
        await caballo.reload({
          include: [
            {
              model: PropietarioCaballo,
              as: 'propiedades',
              where: { actual: true },
              required: false,
              include: [{
                model: User,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellido']
              }]
            }
          ],
          transaction: t
        });

        return caballo;
      });

      logger.info(`Caballo creado: ${result.id} - ${result.nombre}`);

      return {
        success: true,
        data: result
      };
    } catch (error: any) {
      // Mapear errores comunes a mensajes más claros
      let message = 'Error al crear caballo';
      
      // Primero intentamos detectar por el nombre del constraint
      const constraint = String((error as any).parent?.constraint || (error as any).constraint || '').toLowerCase();
      if (constraint.includes('microchip')) {
        message = 'El microchip ya está registrado en otro caballo';
        logger.error('Error creando caballo (microchip duplicado):', { message: error?.message, constraint });
        return {
          success: false,
          error: message
        };
      }
      
      if (error instanceof UniqueConstraintError) {
        const fields = (error as UniqueConstraintError).fields as Record<string, unknown>;
        if (fields && Object.keys(fields).includes('microchip')) {
          message = 'El microchip ya está registrado en otro caballo';
        } else {
          message = 'Violación de unicidad en los datos del caballo';
        }
      } else if (error instanceof ValidationError) {
        message = error.message || 'Datos inválidos para el caballo';
      } else if (error instanceof DatabaseError) {
        const parentMsg = String(error.parent?.message || '').toLowerCase();
        const detail = String((error as any).parent?.detail || '').toLowerCase();
        const msg = String(error.message || '').toLowerCase();

        // Duplicated key (unique constraint) - detectar microchip duplicado
        if (
          parentMsg.includes('duplicate key') || 
          msg.includes('duplicate key') || 
          parentMsg.includes('llave duplicada') || 
          msg.includes('llave duplicada') ||
          parentMsg.includes('unicidad') ||
          msg.includes('unicidad')
        ) {
          if (detail.includes('microchip') || constraint.includes('microchip')) {
            message = 'El microchip ya está registrado en otro caballo';
          } else {
            message = 'Ya existe un registro con esos datos (violación de unicidad)';
          }
        } else if (msg.includes('invalid input value for enum') && msg.includes('sexo')) {
          message = 'Sexo inválido. Debe ser macho o hembra';
        } else if (msg.includes('invalid input value for enum') && msg.includes('disciplina')) {
          message = 'Disciplina inválida';
        } else if (msg.includes('date/time field value out of range')) {
          message = 'Fecha de nacimiento inválida';
        }
      }
      
      logger.error('Error creando caballo:', { message: error?.message, stack: error?.stack });
      return {
        success: false,
        error: message
      };
    }
  }

  /**
   * Obtener todos los caballos con filtros y paginación
   */
  static async getAllCaballos(filters: CaballoFilters): Promise<ServiceResponse<{ caballos: any[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        establecimientoId,
        raza,
        sexo,
        usuarioId,
        userRole
      } = filters;

      const offset = (page - 1) * limit;
      const whereConditions: any = {
        estado_global: {
          [Op.in]: [EstadoGlobalCaballo.activo, EstadoGlobalCaballo.inactivo]
        }
      };

      // Filtros de búsqueda
      if (search) {
        whereConditions[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { raza: { [Op.iLike]: `%${search}%` } },
          { microchip: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (raza) {
        whereConditions.raza = { [Op.iLike]: `%${raza}%` };
      }

      if (sexo) {
        whereConditions.sexo = sexo;
      }

      // Incluir asociaciones
      const includeOptions: any[] = [
        {
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { actual: true },
          required: false, // LEFT JOIN para no excluir caballos sin propiedades
          include: [{
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido']
          }]
        },
        {
          model: CaballoEstablecimiento,
          as: 'asociaciones_establecimientos',
          include: [{
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
          }],
          required: false
        }
      ];

      // Filtro por establecimiento
      if (establecimientoId) {
        includeOptions[1].where = {
          establecimiento_id: establecimientoId,
          estado_asociacion: EstadoAsociacionCE.accepted
        };
        includeOptions[1].required = true;
      }

      // Control de acceso por rol
      if (userRole !== 'admin') {
        if (userRole === 'propietario') {
          // PROPIETARIO: Solo ve sus propios caballos
          includeOptions[0].where = {
            ...includeOptions[0].where,
            propietario_usuario_id: usuarioId
          };
          includeOptions[0].required = true; // INNER JOIN para aplicar el filtro de propietario
        } else if (userRole === 'establecimiento') {
          // ESTABLECIMIENTO: Ve caballos asociados a sus establecimientos
          // Si ya hay filtro por establecimientoId, no hacer nada (el filtro ya está aplicado arriba)
          // Si NO hay filtro, buscar todos los establecimientos del usuario
          if (!establecimientoId) {
            const membresias = await MembresiaUsuarioEstablecimiento.findAll({
              where: {
                usuario_id: usuarioId,
                estado_membresia: EstadoMembresia.active
              }
            });
            
            const establecimientosIds = membresias.map(m => m.establecimiento_id);
            
            if (establecimientosIds.length > 0) {
              includeOptions[1].where = {
                establecimiento_id: { [Op.in]: establecimientosIds },
                estado_asociacion: EstadoAsociacionCE.accepted
              };
              includeOptions[1].required = true;
            } else {
              // No tiene establecimientos, no ve ningún caballo
              whereConditions.id = -1; // Forzar resultado vacío
            }
          }
        } else if (['capataz', 'veterinario', 'empleado'].includes(userRole || '')) {
          // CAPATAZ, VETERINARIO, EMPLEADO: Ven caballos de su establecimiento
          const membresias = await MembresiaUsuarioEstablecimiento.findAll({
            where: {
              usuario_id: usuarioId,
              estado_membresia: EstadoMembresia.active
            }
          });
          
          const establecimientosIds = membresias.map(m => m.establecimiento_id);
          
          if (establecimientosIds.length > 0) {
            includeOptions[1].where = {
              establecimiento_id: { [Op.in]: establecimientosIds },
              estado_asociacion: EstadoAsociacionCE.accepted
            };
            includeOptions[1].required = true;
          } else {
            // No tiene establecimientos, no ve ningún caballo
            whereConditions.id = -1; // Forzar resultado vacío
          }
        } else {
          // Otros roles: solo ven caballos de los que son propietarios
          includeOptions[0].where = {
            ...includeOptions[0].where,
            propietario_usuario_id: usuarioId
          };
          includeOptions[0].required = true;
        }
      }

      logger.debug('getAllCaballos query params', {
        userRole,
        usuarioId,
        whereConditions,
        includeRequired: includeOptions[0].required,
        includeWhere: includeOptions[0].where
      });

      // 🚀 OPTIMIZACIÓN: subQuery: false previene subqueries ineficientes con limit/offset
      const { count, rows } = await Caballo.findAndCountAll({
        where: whereConditions,
        include: includeOptions,
        limit,
        offset,
        order: [['nombre', 'ASC']],
        distinct: true,
        subQuery: false, // ← Previene subqueries ineficientes
        logging: (sql: string) => logger.debug('Sequelize SQL:', sql) // Log SQL query
      });

      const totalPages = Math.ceil(count / limit);

      logger.info(`getAllCaballos result: found ${count} caballos for user ${usuarioId} (role: ${userRole})`);
      if (count === 0) {
        logger.warn('No se encontraron caballos. Verificar filtros:', {
          whereConditions,
          includeOptions: includeOptions.map((opt: any) => ({
            model: opt.model.name,
            required: opt.required,
            where: opt.where
          }))
        });
      }

      // Convertir instancias de Sequelize a JSON plano
      const caballosPlain = rows.map(caballo => caballo.get({ plain: true }));

      return {
        success: true,
        data: {
          caballos: caballosPlain,
          total: count,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error('Error obteniendo caballos:', error);
      return {
        success: false,
        error: 'Error al obtener caballos',
      };
    }
  }

  /**
   * Obtener caballo por ID con control de acceso
   */
  static async getCaballoById(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<Caballo>> {
    try {
      // Base includes - siempre cargar estos datos
      const includeOptions: any[] = [
        {
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { actual: true },
          required: false, // LEFT JOIN - no excluir caballos sin propietarios actuales
          include: [{
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }]
        },
        {
          model: CaballoEstablecimiento,
          as: 'asociaciones_establecimientos',
          include: [{
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre', 'direccion_calle', 'direccion_numero', 'ciudad']
          }],
          required: false
        },
        {
          model: Caballo,
          as: 'padre',
          attributes: ['id', 'nombre', 'raza', 'sexo', 'fecha_nacimiento'],
          required: false,
          include: [
            {
              model: Caballo,
              as: 'padre', // abuelo paterno
              attributes: ['id', 'nombre', 'raza'],
              required: false
            },
            {
              model: Caballo,
              as: 'madre', // abuela paterna
              attributes: ['id', 'nombre', 'raza'],
              required: false
            }
          ]
        },
        {
          model: Caballo,
          as: 'madre',
          attributes: ['id', 'nombre', 'raza', 'sexo', 'fecha_nacimiento'],
          required: false,
          include: [
            {
              model: Caballo,
              as: 'padre', // abuelo materno
              attributes: ['id', 'nombre', 'raza'],
              required: false
            },
            {
              model: Caballo,
              as: 'madre', // abuela materna
              attributes: ['id', 'nombre', 'raza'],
              required: false
            }
          ]
        }
      ];

      // CONTROL DE ACCESO PREVIO - Verificar permisos antes de hacer query
      if (userRole === 'establecimiento') {
        // Establecimientos: Verificar que el caballo esté en sus establecimientos
        const userEstablecimientos = await MembresiaUsuarioEstablecimiento.findAll({
          where: { 
            usuario_id: usuarioId,
            estado_membresia: 'active'
          },
          attributes: ['establecimiento_id']
        });
        
        const establecimientoIds = userEstablecimientos.map(m => m.establecimiento_id);
        
        if (establecimientoIds.length === 0) {
          return {
            success: false,
            error: 'No tienes establecimientos asignados',
          };
        }
        
        // Verificar que el caballo esté asociado a alguno de esos establecimientos
        const caballoEnEstablecimiento = await CaballoEstablecimiento.findOne({
          where: {
            caballo_id: caballoId,
            establecimiento_id: { [Op.in]: establecimientoIds },
            estado_asociacion: 'accepted'
          }
        });
        
        if (!caballoEnEstablecimiento) {
          return {
            success: false,
            error: 'Este caballo no está en tus establecimientos',
          };
        }
      } else if (userRole !== 'admin' && userRole !== 'veterinario') {
        // Propietarios, empleados, capataces: Solo sus caballos
        // Verificar propiedad antes del query principal
        const esPropietario = await PropietarioCaballo.findOne({
          where: {
            caballo_id: caballoId,
            propietario_usuario_id: usuarioId,
            actual: true
          }
        });
        
        if (!esPropietario) {
          return {
            success: false,
            error: 'No tienes permisos para ver este caballo',
          };
        }
      }
      // Admin y veterinario: Acceso total, no necesitan validación previa

      // Si pasó las validaciones, cargar el caballo con todos los datos
      const caballo = await Caballo.findByPk(caballoId, {
        include: includeOptions
      });

      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      return {
        success: true,
        data: caballo,
      };
    } catch (error: any) {
      logger.error('Error obteniendo caballo por ID:', error);
      return {
        success: false,
        error: 'Error al obtener caballo',
      };
    }
  }

  /**
   * Actualizar caballo
   */
  static async updateCaballo(
    caballoId: number,
    data: UpdateCaballoData,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<Caballo>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success || !caballoResult.data) {
        return caballoResult;
      }

      const caballo = caballoResult.data;

      // Actualizar datos
      await caballo.update(data);

  // Recargar con todas las asociaciones
      await caballo.reload({
        include: [
          {
            model: PropietarioCaballo,
            as: 'propiedades',
            where: { actual: true },
            include: [{
              model: User,
              as: 'propietario',
              attributes: ['id', 'nombre', 'apellido']
            }]
          },
          {
            model: CaballoEstablecimiento,
            as: 'asociaciones_establecimientos',
            include: [{
              model: Establecimiento,
              as: 'establecimiento',
              attributes: ['id', 'nombre']
            }],
            required: false
          }
        ]
      });

      logger.info(`Caballo actualizado: ${caballoId}`);
      logger.debug('Valores actualizados caballo', {
        id: caballo.id,
        nombre: (caballo as any).nombre,
        microchip: (caballo as any).microchip,
        foto_url: (caballo as any).foto_url,
      });

      return {
        success: true,
        data: caballo,
      };
    } catch (error: any) {
      logger.error('Error actualizando caballo:', error);
      return {
        success: false,
        error: 'Error al actualizar caballo',
      };
    }
  }

  /**
   * Eliminar caballo (soft delete)
   */
  static async deleteCaballo(caballoId: number): Promise<ServiceResponse<boolean>> {
    try {
      const caballo = await Caballo.findByPk(caballoId);

      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // Soft delete - cambiar estado a vendido (para mantener historial)
      await caballo.update({
        estado_global: EstadoGlobalCaballo.vendido
      });

      logger.info(`Caballo eliminado (soft delete): ${caballoId}`);

      return {
        success: true,
        data: true,
      };
    } catch (error: any) {
      logger.error('Error eliminando caballo:', error);
      return {
        success: false,
        error: 'Error al eliminar caballo',
      };
    }
  }

  /**
   * Agregar propietario a caballo
   */
  static async addPropietarioToCaballo(
    caballoId: number,
    propietarioId: number,
    fechaInicio?: Date,
    porcentaje?: number
  ): Promise<ServiceResponse<PropietarioCaballo>> {
    try {
      // Verificar que el caballo existe
      const caballo = await Caballo.findByPk(caballoId);
      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // Verificar que el usuario existe
      const usuario = await User.findByPk(propietarioId);
      if (!usuario) {
        return {
          success: false,
          error: 'Usuario no encontrado',
        };
      }

      // Crear nueva propiedad
      const propiedad = await PropietarioCaballo.create({
        caballo_id: caballoId,
        propietario_usuario_id: propietarioId,
        fecha_inicio: fechaInicio || new Date(),
        porcentaje_tenencia: porcentaje || 100,
        actual: true
      });

      // Cargar con asociaciones
      await propiedad.reload({
        include: [
          {
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Caballo,
            as: 'caballo',
            attributes: ['id', 'nombre']
          }
        ]
      });

      logger.info(`Propietario agregado al caballo: ${caballoId} -> ${propietarioId}`);

      return {
        success: true,
        data: propiedad,
      };
    } catch (error: any) {
      logger.error('Error agregando propietario:', error);
      return {
        success: false,
        error: 'Error al agregar propietario',
      };
    }
  }

  /**
   * Obtener propietarios de un caballo (solo actuales)
   */
  static async getCaballoPropietarios(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<PropietarioCaballo[]>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const propietarios = await PropietarioCaballo.findAll({
        where: { 
          caballo_id: caballoId,
          actual: true 
        },
        include: [{
          model: User,
          as: 'propietario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }],
        order: [['fecha_inicio', 'DESC']]
      });

      return {
        success: true,
        data: propietarios,
      };
    } catch (error: any) {
      logger.error('Error obteniendo propietarios:', error);
      return {
        success: false,
        error: 'Error al obtener propietarios',
      };
    }
  }

  /**
   * Obtener historial completo de propietarios (actuales + históricos)
   */
  static async getHistorialPropietarios(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<PropietarioCaballo[]>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const propietarios = await PropietarioCaballo.findAll({
        where: { caballo_id: caballoId },
        include: [{
          model: User,
          as: 'propietario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }],
        order: [['actual', 'DESC'], ['fecha_inicio', 'DESC']]
      });

      return {
        success: true,
        data: propietarios,
      };
    } catch (error: any) {
      logger.error('Error obteniendo historial de propietarios:', error);
      return {
        success: false,
        error: 'Error al obtener historial de propietarios',
      };
    }
  }

  /**
   * Actualizar datos de propiedad de un caballo
   */
  static async updatePropietario(
    caballoId: number,
    propietarioId: number,
    data: {
      porcentaje_tenencia?: number;
      fecha_inicio?: Date;
      fecha_fin?: Date;
      actual?: boolean;
    },
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<PropietarioCaballo>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      // Buscar la relación propietario-caballo
      const propiedad = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          propietario_usuario_id: propietarioId
        }
      });

      if (!propiedad) {
        return {
          success: false,
          error: 'Relación propietario-caballo no encontrada',
        };
      }

      // Validar porcentaje si se está actualizando
      if (data.porcentaje_tenencia !== undefined) {
        if (data.porcentaje_tenencia < 0 || data.porcentaje_tenencia > 100) {
          return {
            success: false,
            error: 'El porcentaje debe estar entre 0 y 100',
          };
        }
      }

      // Actualizar campos
      if (data.porcentaje_tenencia !== undefined) {
        propiedad.porcentaje_tenencia = data.porcentaje_tenencia;
      }
      if (data.fecha_inicio !== undefined) {
        propiedad.fecha_inicio = data.fecha_inicio;
      }
      if (data.fecha_fin !== undefined) {
        propiedad.fecha_fin = data.fecha_fin;
      }
      if (data.actual !== undefined) {
        propiedad.actual = data.actual;
        // Si se marca como no actual, poner fecha_fin si no existe
        if (!data.actual && !propiedad.fecha_fin) {
          propiedad.fecha_fin = new Date();
        }
      }

      await propiedad.save();

      // Recargar con asociaciones
      await propiedad.reload({
        include: [{
          model: User,
          as: 'propietario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }]
      });

      logger.info(`Propiedad actualizada: Caballo ${caballoId}, Propietario ${propietarioId}`);

      return {
        success: true,
        data: propiedad,
      };
    } catch (error: any) {
      logger.error('Error actualizando propietario:', error);
      return {
        success: false,
        error: 'Error al actualizar propietario',
      };
    }
  }

  /**
   * Finalizar propiedad de un caballo (marcar como histórico)
   */
  static async removePropietario(
    caballoId: number,
    propietarioId: number,
    fechaFin?: Date,
    usuarioId?: number,
    userRole?: string
  ): Promise<ServiceResponse<PropietarioCaballo>> {
    try {
      // Verificar acceso al caballo si se proporciona usuario
      if (usuarioId && userRole) {
        const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
        
        if (!caballoResult.success) {
          return {
            success: false,
            error: caballoResult.error || 'Sin acceso al caballo',
          };
        }
      }

      // Buscar la relación propietario-caballo
      const propiedad = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          propietario_usuario_id: propietarioId,
          actual: true
        }
      });

      if (!propiedad) {
        return {
          success: false,
          error: 'Propietario actual no encontrado para este caballo',
        };
      }

      // Marcar como no actual y poner fecha fin
      propiedad.actual = false;
      propiedad.fecha_fin = fechaFin || new Date();

      await propiedad.save();

      // Recargar con asociaciones
      await propiedad.reload({
        include: [{
          model: User,
          as: 'propietario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        }]
      });

      logger.info(`Propiedad finalizada: Caballo ${caballoId}, Propietario ${propietarioId}`);

      return {
        success: true,
        data: propiedad,
      };
    } catch (error: any) {
      logger.error('Error finalizando propiedad:', error);
      return {
        success: false,
        error: 'Error al finalizar propiedad',
      };
    }
  }

  /**
   * Obtener pedigrí de un caballo
   */
  static async getCaballoPedigree(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const caballo = await Caballo.findByPk(caballoId, {
        include: [
          {
            model: Caballo,
            as: 'padre',
            include: [
              { model: Caballo, as: 'padre', attributes: ['id', 'nombre'] },
              { model: Caballo, as: 'madre', attributes: ['id', 'nombre'] }
            ]
          },
          {
            model: Caballo,
            as: 'madre',
            include: [
              { model: Caballo, as: 'padre', attributes: ['id', 'nombre'] },
              { model: Caballo, as: 'madre', attributes: ['id', 'nombre'] }
            ]
          }
        ]
      }) as any;

      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      const pedigree = {
        caballo: {
          id: caballo.id,
          nombre: caballo.nombre
        },
        padre: caballo.padre ? {
          id: caballo.padre.id,
          nombre: caballo.padre.nombre
        } : null,
        madre: caballo.madre ? {
          id: caballo.madre.id,
          nombre: caballo.madre.nombre
        } : null,
        abueloPaterno: caballo.padre?.padre ? {
          id: caballo.padre.padre.id,
          nombre: caballo.padre.padre.nombre
        } : null,
        abuelaPaterna: caballo.padre?.madre ? {
          id: caballo.padre.madre.id,
          nombre: caballo.padre.madre.nombre
        } : null,
        abueloMaterno: caballo.madre?.padre ? {
          id: caballo.madre.padre.id,
          nombre: caballo.madre.padre.nombre
        } : null,
        abuelaMaterna: caballo.madre?.madre ? {
          id: caballo.madre.madre.id,
          nombre: caballo.madre.madre.nombre
        } : null
      };

      return {
        success: true,
        data: pedigree,
      };
    } catch (error: any) {
      logger.error('Error obteniendo pedigrí:', error);
      return {
        success: false,
        error: 'Error al obtener pedigrí',
      };
    }
  }

  /**
   * Obtener descendencia de un caballo
   */
  static async getCaballoDescendencia(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<{ hijos: Caballo[]; hijas: Caballo[] }>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const descendencia = await Caballo.findAll({
        where: {
          [Op.or]: [
            { padre_id: caballoId },
            { madre_id: caballoId }
          ],
          estado_global: EstadoGlobalCaballo.activo
        },
        include: [
          {
            model: PropietarioCaballo,
            as: 'propiedades',
            where: { actual: true },
            include: [{
              model: User,
              as: 'propietario',
              attributes: ['id', 'nombre', 'apellido']
            }]
          }
        ],
        order: [['fecha_nacimiento', 'DESC']]
      });

      const hijos = descendencia.filter(h => h.sexo === SexoCaballo.macho);
      const hijas = descendencia.filter(h => h.sexo === SexoCaballo.hembra);

      return {
        success: true,
        data: {
          hijos,
          hijas
        },
      };
    } catch (error: any) {
      logger.error('Error obteniendo descendencia:', error);
      return {
        success: false,
        error: 'Error al obtener descendencia',
      };
    }
  }

  /**
   * Obtener historial médico de un caballo
   */
  static async getCaballoHistorialMedico(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<Evento[]>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const eventos = await Evento.findAll({
        where: { caballo_id: caballoId },
        include: [
          {
            model: TipoEvento,
            as: 'tipo_evento',
            // El modelo TipoEvento no tiene columna "categoria"; usar "disciplina" o solo nombre
            attributes: ['id', 'nombre', 'disciplina']
          },
          {
            model: User,
            as: 'creado_por',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          },
          {
            model: User,
            as: 'validado_por',
            attributes: ['id', 'nombre', 'apellido'],
            required: false
          }
        ],
        order: [['fecha_evento', 'DESC']]
      });

      return {
        success: true,
        data: eventos,
      };
    } catch (error: any) {
      logger.error('Error obteniendo historial médico:', error);
      return {
        success: false,
        error: 'Error al obtener historial médico',
      };
    }
  }

  /**
   * Mover caballo a otro establecimiento
   */
  static async moverCaballoEstablecimiento(
    caballoId: number,
    nuevoEstablecimientoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<CaballoEstablecimiento>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      // Verificar que el establecimiento existe
      const establecimiento = await Establecimiento.findByPk(nuevoEstablecimientoId);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Desactivar asociaciones actuales
      await CaballoEstablecimiento.update(
        { estado_asociacion: EstadoAsociacionCE.finished },
        { where: { caballo_id: caballoId, estado_asociacion: EstadoAsociacionCE.accepted } }
      );

      // Crear nueva asociación
      const nuevaAsociacion = await CaballoEstablecimiento.create({
        caballo_id: caballoId,
        establecimiento_id: nuevoEstablecimientoId,
        fecha_inicio: new Date(),
        estado_asociacion: EstadoAsociacionCE.accepted
      });

      await nuevaAsociacion.reload({
        include: [{
          model: Establecimiento,
          as: 'establecimiento',
          attributes: ['id', 'nombre', 'direccion_calle', 'direccion_numero', 'ciudad']
        }]
      });

      logger.info(`Caballo movido: ${caballoId} -> Establecimiento ${nuevoEstablecimientoId}`);

      return {
        success: true,
        data: nuevaAsociacion,
      };
    } catch (error: any) {
      logger.error('Error moviendo caballo:', error);
      return {
        success: false,
        error: 'Error al mover caballo',
      };
    }
  }

  /**
   * Obtener estadísticas de un caballo
   */
  static async getCaballoStats(
    caballoId: number,
    usuarioId: number,
    userRole?: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Verificar acceso al caballo
      const caballoResult = await this.getCaballoById(caballoId, usuarioId, userRole);
      
      if (!caballoResult.success || !caballoResult.data) {
        return {
          success: false,
          error: caballoResult.error || 'Sin acceso al caballo',
        };
      }

      const caballo = caballoResult.data;

      // Contar eventos médicos
      const totalEventos = await Evento.count({
        where: { caballo_id: caballoId }
      });

      // Contar descendencia
      const descendencia = await Caballo.count({
        where: {
          [Op.or]: [
            { padre_id: caballoId },
            { madre_id: caballoId }
          ],
          estado_global: EstadoGlobalCaballo.activo
        }
      });

      // Último evento
      const ultimoEvento = await Evento.findOne({
        where: { caballo_id: caballoId },
        include: [{
          model: TipoEvento,
          as: 'tipo_evento',
          attributes: ['nombre']
        }],
        order: [['fecha_evento', 'DESC']]
      }) as any;

      // Calcular edad
      const edad = caballo.fecha_nacimiento ? 
        Math.floor((Date.now() - new Date(caballo.fecha_nacimiento).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
        null;

      const stats = {
        totalEventos,
        descendencia,
        ultimoEvento: ultimoEvento ? {
          fecha: ultimoEvento.fecha_evento,
          tipo: ultimoEvento.tipo_evento?.nombre || 'Sin tipo'
        } : null,
        edad
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      logger.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: 'Error al obtener estadísticas',
      };
    }
  }
}