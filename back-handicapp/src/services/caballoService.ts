// src/services/caballoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Caballos
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Caballo } from '../models/Caballo';
import { User } from '../models/User';
import { Establecimiento } from '../models/Establecimiento';
import { PropietarioCaballo } from '../models/PropietarioCaballo';
import { CaballoEstablecimiento } from '../models/CaballoEstablecimiento';
import { Evento } from '../models/Evento';
import { TipoEvento } from '../models/TipoEvento';
import { ServiceResponse, PaginationQuery } from '../types';
import { 
  SexoCaballo, 
  Disciplina, 
  EstadoGlobalCaballo,
  EstadoAsociacionCE 
} from '../models/enums';

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
}

interface UpdateCaballoData extends Partial<CreateCaballoData> {
  estado_global?: EstadoGlobalCaballo;
}

export class CaballoService {
  
  // Obtener caballos del usuario (como propietario)
  static async getCaballosByUser(
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ caballos: Caballo[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Caballo.findAndCountAll({
        include: [{
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { 
            propietario_usuario_id: userId,
            actual: true 
          },
          include: [{
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido']
          }]
        }, {
          model: Caballo,
          as: 'padre',
          attributes: ['id', 'nombre'],
          required: false
        }, {
          model: Caballo,
          as: 'madre',
          attributes: ['id', 'nombre'],
          required: false
        }],
        where: {
          estado_global: {
            [Op.in]: [EstadoGlobalCaballo.activo, EstadoGlobalCaballo.inactivo]
          }
        },
        limit,
        offset,
        order: [[sortBy, sortOrder]],
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
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener caballos',
      };
    }
  }

  // Obtener caballos de un establecimiento
  static async getCaballosByEstablecimiento(
    establecimientoId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ caballos: Caballo[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Caballo.findAndCountAll({
        include: [{
          model: CaballoEstablecimiento,
          as: 'asociaciones_establecimientos',
          where: { 
            establecimiento_id: establecimientoId,
            estado_asociacion: EstadoAsociacionCE.accepted 
          },
          include: [{
            model: Establecimiento,
            as: 'establecimiento',
            attributes: ['id', 'nombre']
          }]
        }, {
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { actual: true },
          include: [{
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido']
          }]
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
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
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener caballos del establecimiento',
      };
    }
  }

  // Obtener caballo por ID con información completa
  static async getCaballoById(
    caballoId: number
  ): Promise<ServiceResponse<Caballo>> {
    try {
      const caballo = await Caballo.findByPk(caballoId, {
        include: [
          {
            model: PropietarioCaballo,
            as: 'propiedades',
            include: [{
              model: User,
              as: 'propietario',
              attributes: ['id', 'nombre', 'apellido', 'email']
            }]
          },
          {
            model: CaballoEstablecimiento,
            as: 'asociaciones_establecimientos',
            where: { estado_asociacion: EstadoAsociacionCE.accepted },
            required: false,
            include: [{
              model: Establecimiento,
              as: 'establecimiento',
              attributes: ['id', 'nombre', 'ciudad']
            }]
          },
          {
            model: Caballo,
            as: 'padre',
            attributes: ['id', 'nombre', 'sexo', 'raza'],
            required: false
          },
          {
            model: Caballo,
            as: 'madre',
            attributes: ['id', 'nombre', 'sexo', 'raza'],
            required: false
          },
          {
            model: Evento,
            as: 'eventos',
            include: [{
              model: TipoEvento,
              as: 'tipo_evento',
              attributes: ['id', 'nombre', 'clave']
            }],
            order: [['fecha_evento', 'DESC']],
            limit: 10,
            required: false
          }
        ]
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
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener caballo',
      };
    }
  }

  // Crear nuevo caballo
  static async createCaballo(
    data: CreateCaballoData,
    propietarioUserId: number
  ): Promise<ServiceResponse<Caballo>> {
    try {
      // Verificar microchip único si se proporciona
      if (data.microchip) {
        const existingCaballo = await Caballo.findOne({
          where: { microchip: data.microchip }
        });
        
        if (existingCaballo) {
          return {
            success: false,
            error: 'Ya existe un caballo con este microchip',
          };
        }
      }

      // Crear el caballo
      const caballo = await Caballo.create(data);

      // Crear la relación de propiedad
      await PropietarioCaballo.create({
        caballo_id: caballo.id,
        propietario_usuario_id: propietarioUserId,
        actual: true,
        porcentaje_tenencia: 100,
        fecha_inicio: new Date(),
      });

      // Si se especifica un establecimiento, crear la asociación
      if (data.establecimiento_id) {
        await CaballoEstablecimiento.create({
          caballo_id: caballo.id,
          establecimiento_id: data.establecimiento_id,
          estado_asociacion: EstadoAsociacionCE.accepted,
          fecha_inicio: new Date(),
        });
      }

      return {
        success: true,
        data: caballo,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear caballo',
      };
    }
  }

  // Actualizar caballo
  static async updateCaballo(
    caballoId: number,
    data: UpdateCaballoData,
    userId: number
  ): Promise<ServiceResponse<Caballo>> {
    try {
      // Verificar que el usuario es propietario del caballo
      const propiedad = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          propietario_usuario_id: userId,
          actual: true
        }
      });

      if (!propiedad) {
        return {
          success: false,
          error: 'Sin permisos para modificar este caballo',
        };
      }

      const caballo = await Caballo.findByPk(caballoId);
      
      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // Verificar microchip único si se está cambiando
      if (data.microchip && data.microchip !== caballo.microchip) {
        const existing = await Caballo.findOne({
          where: { 
            microchip: data.microchip,
            id: { [Op.ne]: caballoId }
          }
        });
        
        if (existing) {
          return {
            success: false,
            error: 'Ya existe otro caballo con este microchip',
          };
        }
      }

      await caballo.update({
        ...data,
        actualizado_el: new Date(),
      });

      return {
        success: true,
        data: caballo,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar caballo',
      };
    }
  }

  // Buscar caballos
  static async searchCaballos(
    query: string,
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ caballos: Caballo[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Caballo.findAndCountAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${query}%` } },
            { raza: { [Op.iLike]: `%${query}%` } },
            { microchip: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [{
          model: PropietarioCaballo,
          as: 'propiedades',
          where: { 
            propietario_usuario_id: userId,
            actual: true 
          },
          required: true,
          include: [{
            model: User,
            as: 'propietario',
            attributes: ['id', 'nombre', 'apellido']
          }]
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
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
    } catch (error) {
      return {
        success: false,
        error: 'Error en la búsqueda de caballos',
      };
    }
  }

  // Obtener pedigrí del caballo
  static async getCaballoPedigree(
    caballoId: number
  ): Promise<ServiceResponse<{
    caballo: Caballo;
    padre?: Caballo;
    madre?: Caballo;
    abueloPaterno?: Caballo;
    abuelaPaterna?: Caballo;
    abueloMaterno?: Caballo;
    abuelaMaterna?: Caballo;
  }>> {
    try {
      const caballo = await Caballo.findByPk(caballoId, {
        include: [
          {
            model: Caballo,
            as: 'padre',
            include: [
              { model: Caballo, as: 'padre', attributes: ['id', 'nombre', 'sexo'] },
              { model: Caballo, as: 'madre', attributes: ['id', 'nombre', 'sexo'] }
            ],
            required: false
          },
          {
            model: Caballo,
            as: 'madre',
            include: [
              { model: Caballo, as: 'padre', attributes: ['id', 'nombre', 'sexo'] },
              { model: Caballo, as: 'madre', attributes: ['id', 'nombre', 'sexo'] }
            ],
            required: false
          }
        ]
      });

      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      const pedigree = {
        caballo,
        padre: caballo.padre,
        madre: caballo.madre,
        abueloPaterno: caballo.padre?.padre,
        abuelaPaterna: caballo.padre?.madre,
        abueloMaterno: caballo.madre?.padre,
        abuelaMaterna: caballo.madre?.madre,
      };

      return {
        success: true,
        data: pedigree,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener pedigrí',
      };
    }
  }
}