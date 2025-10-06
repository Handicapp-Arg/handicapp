// src/services/caballoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Caballos (LIMPIO)
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Caballo } from '../models/Caballo';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
import { PropietarioCaballo } from '../models/PropietarioCaballo';
import { CaballoEstablecimiento } from '../models/CaballoEstablecimiento';
import { Evento } from '../models/Evento';
import { TipoEvento } from '../models/TipoEvento';
import { ServiceResponse } from '../types';
import { 
  SexoCaballo, 
  Disciplina, 
  EstadoGlobalCaballo,
  EstadoAsociacionCE 
} from '../models/enums';
import { logger } from '../utils/logger';

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
      // Crear caballo con estado activo por defecto
      const caballoData = {
        ...data,
        estado_global: EstadoGlobalCaballo.activo
      };

      const caballo = await Caballo.create(caballoData);

      // Crear relación de propiedad
      await PropietarioCaballo.create({
        caballo_id: caballo.id,
        propietario_usuario_id: data.creadoPorUsuarioId,
        fecha_inicio: new Date(),
        porcentaje_tenencia: 100,
        actual: true
      });

      // Si hay establecimiento, crear asociación
      if (data.establecimiento_id) {
        await CaballoEstablecimiento.create({
          caballo_id: caballo.id,
          establecimiento_id: data.establecimiento_id,
          fecha_inicio: new Date(),
          estado_asociacion: EstadoAsociacionCE.accepted
        });
      }

      // Recargar con asociaciones
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
          }
        ]
      });

      logger.info(`Caballo creado: ${caballo.id} - ${caballo.nombre}`);

      return {
        success: true,
        data: caballo
      };
    } catch (error: any) {
      logger.error('Error creando caballo:', error);
      return {
        success: false,
        error: 'Error al crear caballo'
      };
    }
  }

  /**
   * Obtener todos los caballos con filtros y paginación
   */
  static async getAllCaballos(filters: CaballoFilters): Promise<ServiceResponse<{ caballos: Caballo[]; total: number; totalPages: number }>> {
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
        // Los usuarios no-admin solo ven sus propios caballos
        includeOptions[0].where = {
          ...includeOptions[0].where,
          propietario_usuario_id: usuarioId
        };
      }

      const { count, rows } = await Caballo.findAndCountAll({
        where: whereConditions,
        include: includeOptions,
        limit,
        offset,
        order: [['nombre', 'ASC']],
        distinct: true
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          caballos: rows,
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
      const includeOptions: any[] = [
        {
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { actual: true },
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
            attributes: ['id', 'nombre', 'direccion']
          }],
          required: false
        },
        {
          model: Caballo,
          as: 'padre',
          attributes: ['id', 'nombre'],
          required: false
        },
        {
          model: Caballo,
          as: 'madre',
          attributes: ['id', 'nombre'],
          required: false
        }
      ];

      // Control de acceso por rol
      if (userRole !== 'admin' && userRole !== 'veterinario') {
        includeOptions[0].where = {
          ...includeOptions[0].where,
          propietario_usuario_id: usuarioId
        };
      }

      const caballo = await Caballo.findByPk(caballoId, {
        include: includeOptions
      });

      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado o sin permisos',
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
   * Obtener propietarios de un caballo
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
        where: { caballo_id: caballoId },
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
            attributes: ['id', 'nombre', 'categoria']
          },
          {
            model: User,
            as: 'veterinario',
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
          attributes: ['id', 'nombre', 'direccion']
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