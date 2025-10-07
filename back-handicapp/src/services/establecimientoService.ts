// src/services/establecimientoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Establecimientos
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Establecimiento } from '../models/Establecimiento';
import { User } from '../models/User';
import { MembresiaUsuarioEstablecimiento } from '../models/MembresiaUsuarioEstablecimiento';
import { ServiceResponse, PaginationQuery } from '../types';
import { EstadoMembresia, RolEnEstablecimiento, Disciplina } from '../models/enums';
// import errors helpers (no direct use here)

interface CreateEstablecimientoData {
  nombre: string;
  cuit: string;
  email?: string;
  telefono?: string;
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  logo_url?: string;
  disciplina_principal?: string;
}

interface UpdateEstablecimientoData extends Partial<CreateEstablecimientoData> {}

export class EstablecimientoService {
  
  // Obtener establecimientos del usuario
  static async getEstablecimientosByUser(
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ establecimientos: Establecimiento[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Establecimiento.findAndCountAll({
        include: [{
          model: MembresiaUsuarioEstablecimiento,
          as: 'membresias',
          where: { 
            usuario_id: userId,
            estado_membresia: EstadoMembresia.active 
          },
          attributes: ['rol_en_establecimiento', 'fecha_inicio']
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          establecimientos: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener establecimientos',
      };
    }
  }

  // Obtener establecimiento por ID
  static async getEstablecimientoById(
    establecimientoId: number,
    userId: number
  ): Promise<ServiceResponse<Establecimiento>> {
    try {
      const establecimiento = await Establecimiento.findByPk(establecimientoId, {
        include: [{
          model: MembresiaUsuarioEstablecimiento,
          as: 'membresias',
          where: { 
            usuario_id: userId,
            estado_membresia: EstadoMembresia.active 
          },
          required: true,
          include: [{
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'email']
          }]
        }]
      });

      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado o sin acceso',
        };
      }

      return {
        success: true,
        data: establecimiento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener establecimiento',
      };
    }
  }

  // Crear nuevo establecimiento
  static async createEstablecimiento(
    data: CreateEstablecimientoData,
    userId: number,
    rolEnEstablecimiento: RolEnEstablecimiento = RolEnEstablecimiento.capataz
  ): Promise<ServiceResponse<Establecimiento>> {
    try {
      // Verificar que no exista otro establecimiento con el mismo nombre o CUIT
      const existingByNombre = await Establecimiento.findOne({
        where: { nombre: data.nombre }
      });
      
      if (existingByNombre) {
        return {
          success: false,
          error: 'Ya existe un establecimiento con este nombre',
        };
      }

      const existingByCuit = await Establecimiento.findOne({
        where: { cuit: data.cuit }
      });
      
      if (existingByCuit) {
        return {
          success: false,
          error: 'Ya existe un establecimiento con este CUIT',
        };
      }

      // Crear el establecimiento
      const establecimiento = await Establecimiento.create({
        ...data,
        disciplina_principal: (data.disciplina_principal as Disciplina | undefined) ?? null,
      } as any);

      // Crear la membresía del usuario como administrador del establecimiento
      await MembresiaUsuarioEstablecimiento.create({
        usuario_id: userId,
        establecimiento_id: establecimiento.id,
        rol_en_establecimiento: rolEnEstablecimiento,
        estado_membresia: EstadoMembresia.active,
        fecha_inicio: new Date(),
      });

      return {
        success: true,
        data: establecimiento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear establecimiento',
      };
    }
  }

  // Actualizar establecimiento
  static async updateEstablecimiento(
    establecimientoId: number,
    data: UpdateEstablecimientoData,
    userId: number
  ): Promise<ServiceResponse<Establecimiento>> {
    try {
      // Verificar que el usuario tiene permisos para modificar este establecimiento
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          usuario_id: userId,
          establecimiento_id: establecimientoId,
          estado_membresia: EstadoMembresia.active,
          rol_en_establecimiento: {
            [Op.in]: [RolEnEstablecimiento.capataz] // Solo capataces pueden modificar
          }
        }
      });

      if (!membresia) {
        return {
          success: false,
          error: 'Sin permisos para modificar este establecimiento',
        };
      }

      const establecimiento = await Establecimiento.findByPk(establecimientoId);
      
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Verificar unicidad si se está cambiando nombre o CUIT
      if (data.nombre && data.nombre !== establecimiento.nombre) {
        const existing = await Establecimiento.findOne({
          where: { 
            nombre: data.nombre,
            id: { [Op.ne]: establecimientoId }
          }
        });
        
        if (existing) {
          return {
            success: false,
            error: 'Ya existe otro establecimiento con este nombre',
          };
        }
      }

      if (data.cuit && data.cuit !== establecimiento.cuit) {
        const existing = await Establecimiento.findOne({
          where: { 
            cuit: data.cuit,
            id: { [Op.ne]: establecimientoId }
          }
        });
        
        if (existing) {
          return {
            success: false,
            error: 'Ya existe otro establecimiento con este CUIT',
          };
        }
      }

      const updatePayload: any = { ...data, actualizado_el: new Date() };
      if (Object.prototype.hasOwnProperty.call(data, 'disciplina_principal')) {
        updatePayload.disciplina_principal = (data.disciplina_principal as Disciplina | undefined) ?? null;
      }
      await establecimiento.update(updatePayload);

      return {
        success: true,
        data: establecimiento,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar establecimiento',
      };
    }
  }

  // Buscar establecimientos
  static async searchEstablecimientos(
    query: string,
    userId: number,
    pagination: PaginationQuery = {}
  ): Promise<ServiceResponse<{ establecimientos: Establecimiento[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
      } = pagination;

      const offset = (page - 1) * limit;

      const { count, rows } = await Establecimiento.findAndCountAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${query}%` } },
            { ciudad: { [Op.iLike]: `%${query}%` } },
            { provincia: { [Op.iLike]: `%${query}%` } },
          ],
        },
        include: [{
          model: MembresiaUsuarioEstablecimiento,
          as: 'membresias',
          where: { 
            usuario_id: userId,
            estado_membresia: EstadoMembresia.active 
          },
          required: true,
          attributes: ['rol_en_establecimiento']
        }],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          establecimientos: rows,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error en la búsqueda de establecimientos',
      };
    }
  }

  // Obtener estadísticas del establecimiento
  static async getEstablecimientoStats(
    establecimientoId: number,
    userId: number
  ): Promise<ServiceResponse<{
    totalCaballos: number;
    totalUsuarios: number;
    eventosRecientes: number;
    tareasAbiertas: number;
  }>> {
    try {
      // Verificar acceso
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          usuario_id: userId,
          establecimiento_id: establecimientoId,
          estado_membresia: EstadoMembresia.active
        }
      });

      if (!membresia) {
        return {
          success: false,
          error: 'Sin acceso a este establecimiento',
        };
      }

      // Aquí harías las consultas para obtener estadísticas
      // Por ahora retornamos datos de ejemplo
      const stats = {
        totalCaballos: 0,
        totalUsuarios: 0,
        eventosRecientes: 0,
        tareasAbiertas: 0,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas',
      };
    }
  }
}