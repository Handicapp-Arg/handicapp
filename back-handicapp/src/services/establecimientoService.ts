// src/services/establecimientoService.ts
// -----------------------------------------------------------------------------
// HandicApp API - Servicio de Establecimientos
// -----------------------------------------------------------------------------

import { Op } from 'sequelize';
import { Establecimiento } from '../models/Establecimiento';
import { User } from '../models/User';
import { Role } from '../models/roles';
import { MembresiaUsuarioEstablecimiento } from '../models/MembresiaUsuarioEstablecimiento';
import { CaballoEstablecimiento } from '../models/CaballoEstablecimiento';
import { Caballo } from '../models/Caballo';
import { PropietarioCaballo } from '../models/PropietarioCaballo';
import { ServiceResponse, PaginationQuery } from '../types';
import { EstadoMembresia, RolEnEstablecimiento, Disciplina, EstadoAsociacionCE, EstadoUsuario } from '../models/enums';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
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
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  logo_url?: string;
  disciplina_principal?: string;
  tipo_establecimiento?: string;
  estado?: string;
  superficie_hectareas?: number;
  cantidad_boxes?: number;
  servicios?: string[];
  // Datos del administrador (opcionales)
  admin_email?: string;
  admin_password?: string;
  admin_nombre?: string;
  admin_apellido?: string;
}

interface UpdateEstablecimientoData extends Partial<CreateEstablecimientoData> {}

export class EstablecimientoService {
  
  // Obtener todos los establecimientos públicos (sin requerir membresía)
  static async getAllPublicEstablecimientos(
    pagination: PaginationQuery = {},
    usuarioId?: number
  ): Promise<ServiceResponse<{ establecimientos: any[]; total: number; totalPages: number }>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'nombre',
        sortOrder = 'ASC',
        search = ''
      } = pagination;

      const offset = (page - 1) * limit;

      const whereConditions: any[] = [];
      
      // Si hay usuarioId (propietario), solo mostrar activos
      // Si no hay usuarioId (admin), mostrar todos los estados
      if (usuarioId) {
        whereConditions.push({ estado: 'activo' }); // Solo establecimientos activos para propietarios
      }
      // Si no hay usuarioId, no filtrar por estado (admin ve todos)

      // Si hay búsqueda, filtrar por nombre, ciudad o provincia
      if (search) {
        whereConditions.push({
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${search}%` } },
            { ciudad: { [Op.iLike]: `%${search}%` } },
            { provincia: { [Op.iLike]: `%${search}%` } }
          ]
        });
      }

      const whereClause = whereConditions.length > 0 
        ? { [Op.and]: whereConditions }
        : {};

      logger.info('🔍 getAllPublicEstablecimientos query', { 
        usuarioId, 
        whereConditions: whereConditions.length, 
        whereClause,
        page, 
        limit, 
        search 
      });

      // Preparar includes - si no hay usuarioId (admin), incluir usuarios
      const includes: any[] = [];
      if (!usuarioId) {
        // Admin ve los usuarios del establecimiento (solo los que tienen establecimiento_id)
        includes.push({
          model: User,
          as: 'usuarios',
          where: { establecimiento_id: { [Op.ne]: null } }, // Solo usuarios que pertenecen a algún establecimiento
          required: false, // LEFT JOIN para que devuelva establecimientos aunque no tengan usuarios
          attributes: ['id', 'nombre', 'apellido', 'email', 'rol_id', 'creado_el', 'establecimiento_id'],
          include: [{
            model: Role,
            as: 'rol',
            attributes: ['id', 'clave', 'nombre']
          }]
        });
      }

      const { count, rows } = await Establecimiento.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        include: includes,
      });

      logger.info('📊 getAllPublicEstablecimientos result', { 
        count, 
        rowsCount: rows.length,
        includes: includes.length,
        usuariosEnPrimerEstab: (rows[0] as any)?.usuarios?.length || 0,
        primerosUsuarios: (rows[0] as any)?.usuarios?.map((u: any) => ({
          id: u.id,
          email: u.email,
          establecimiento_id: u.establecimiento_id
        }))
      });

      // Si es propietario, agregar info de sus caballos en cada establecimiento
      // Si es admin (sin usuarioId), devolver todos los establecimientos sin info de caballos
      let establecimientosConInfo = rows.map(e => e.toJSON());
      
      // Inicializar mis_caballos como array vacío para todos los establecimientos
      establecimientosConInfo = establecimientosConInfo.map((est: any) => ({
        ...est,
        mis_caballos: [],
        caballos_count: 0
      }));
      
      if (usuarioId) {
        // Obtener IDs de caballos del propietario
        const propiedades = await PropietarioCaballo.findAll({
          where: { 
            propietario_usuario_id: usuarioId,
            actual: true
          },
          attributes: ['caballo_id']
        });
        
        const misCaballosIds = propiedades.map(p => p.caballo_id);
        
        if (misCaballosIds.length > 0) {
          // Obtener asociaciones de MIS caballos con establecimientos
          const asociaciones = await CaballoEstablecimiento.findAll({
            where: {
              estado_asociacion: EstadoAsociacionCE.accepted,
              caballo_id: { [Op.in]: misCaballosIds }
            },
            include: [{
              model: Caballo,
              as: 'caballo',
              attributes: ['id', 'nombre', 'estado_global']
            }]
          });

          // Agrupar caballos por establecimiento
          const caballosPorEstab = asociaciones.reduce((acc: any, asoc: any) => {
            const estabId = asoc.getDataValue('establecimiento_id');
            if (!acc[estabId]) acc[estabId] = [];
            const caballo = asoc.caballo || asoc.getDataValue('caballo');
            acc[estabId].push({
              id: caballo?.id || caballo?.getDataValue('id'),
              nombre: caballo?.nombre || caballo?.getDataValue('nombre'),
              estado_global: caballo?.estado_global || caballo?.getDataValue('estado_global')
            });
            return acc;
          }, {});

          // Agregar info a cada establecimiento
          establecimientosConInfo = establecimientosConInfo.map((est: any) => ({
            ...est,
            mis_caballos: caballosPorEstab[est.id] || [],
            caballos_count: (caballosPorEstab[est.id] || []).length
          }));
        }
      }

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          establecimientos: establecimientosConInfo,
          total: count,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('Error al obtener establecimientos públicos', { error });
      return {
        success: false,
        error: 'Error al obtener establecimientos',
      };
    }
  }
  
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
      // Primero verificar si el usuario existe y obtener su rol
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          as: 'rol',
          attributes: ['clave']
        }]
      });

      const isAdmin = (user as any)?.rol?.clave === 'admin';

      // Si es admin, puede ver cualquier establecimiento sin restricción
      if (isAdmin) {
        const establecimiento = await Establecimiento.findByPk(establecimientoId, {
          include: [{
            model: User,
            as: 'usuarios',
            where: { establecimiento_id: establecimientoId }, // Solo usuarios de ESTE establecimiento
            required: false,
            attributes: ['id', 'nombre', 'apellido', 'email', 'rol_id', 'creado_el', 'establecimiento_id'],
            include: [{
              model: Role,
              as: 'rol',
              attributes: ['id', 'clave', 'nombre']
            }]
          }]
        });

        logger.info('🔍 getEstablecimientoById (admin)', {
          establecimientoId,
          encontrado: !!establecimiento,
          usuarios: (establecimiento as any)?.usuarios?.length || 0,
          usuariosData: (establecimiento as any)?.usuarios?.map((u: any) => ({
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            establecimiento_id: u.establecimiento_id,
            rol: u.rol?.clave
          }))
        });

        if (!establecimiento) {
          return {
            success: false,
            error: 'Establecimiento no encontrado',
          };
        }

        return {
          success: true,
          data: establecimiento,
        };
      }

      // Para otros usuarios, verificar membresía activa
      /*
      const establecimiento = await Establecimiento.findByPk(establecimientoId, {
        include: [
          {
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
          },
          {
            model: User,
            as: 'usuarios',
            where: { establecimiento_id: establecimientoId }, // Solo usuarios de ESTE establecimiento
            required: false,
            attributes: ['id', 'nombre', 'apellido', 'email', 'rol_id', 'creado_el', 'establecimiento_id'],
            include: [{
              model: Role,
              as: 'rol',
              attributes: ['id', 'clave', 'nombre']
            }]
          }
        ]
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
      */
      // Permitir acceso universal (sin membresía)
      const establecimiento = await Establecimiento.findByPk(establecimientoId, {
        include: [
          {
            model: User,
            as: 'usuarios',
            where: { establecimiento_id: establecimientoId },
            required: false,
            attributes: ['id', 'nombre', 'apellido', 'email', 'rol_id', 'creado_el', 'establecimiento_id'],
            include: [{
              model: Role,
              as: 'rol',
              attributes: ['id', 'clave', 'nombre']
            }]
          }
        ]
      });

      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      return {
        success: true,
        data: establecimiento,
      };
    } catch (error) {
      logger.error('Error al obtener establecimiento por ID', { error });
      return {
        success: false,
        error: 'Error al obtener establecimiento',
      };
    }
  }

  static async createEstablecimiento(
    data: CreateEstablecimientoData,
    userId: number,
    rolEnEstablecimiento: RolEnEstablecimiento = RolEnEstablecimiento.capataz
  ): Promise<ServiceResponse<Establecimiento>> {
    try {
      // Verificar que no exista otro establecimiento con el mismo nombre o CUIT
      const existing = await Establecimiento.findOne({
        where: {
          [Op.or]: [
            { nombre: data.nombre },
            { cuit: data.cuit }
          ]
        }
      });
      
      if (existing) {
        if (existing.nombre === data.nombre) {
          return {
            success: false,
            error: 'Ya existe un establecimiento con este nombre',
          };
        }
        return {
          success: false,
          error: 'Ya existe un establecimiento con este CUIT',
        };
      }

      // Si se proporcionan datos del admin, verificar que el email no exista
      if (data.admin_email) {
        const existingUser = await User.findOne({
          where: { email: data.admin_email }
        });
        if (existingUser) {
          return {
            success: false,
            error: 'Ya existe un usuario con este email',
          };
        }
      }

      // Crear el establecimiento
      const establecimiento = await Establecimiento.create({
        nombre: data.nombre,
        cuit: data.cuit,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion_calle: data.direccion_calle || null,
        direccion_numero: data.direccion_numero || null,
        direccion_complemento: data.direccion_complemento || null,
        codigo_postal: data.codigo_postal || null,
        ciudad: data.ciudad || null,
        provincia: data.provincia || null,
        pais: data.pais || null,
        latitud: data.latitud || null,
        longitud: data.longitud || null,
        descripcion: data.descripcion || null,
        logo_url: data.logo_url || null,
        disciplina_principal: (data.disciplina_principal as Disciplina | undefined) ?? null,
        tipo_establecimiento: (data as any).tipo_establecimiento || 'mixto',
        estado: (data as any).estado || 'activo',
        superficie_hectareas: (data as any).superficie_hectareas || null,
        cantidad_boxes: (data as any).cantidad_boxes || null,
        servicios: (data as any).servicios || [],
      });

      // Crear la membresía del usuario que crea el establecimiento
      await MembresiaUsuarioEstablecimiento.create({
        usuario_id: userId,
        establecimiento_id: establecimiento.id,
        rol_en_establecimiento: rolEnEstablecimiento,
        estado_membresia: EstadoMembresia.active,
        fecha_inicio: new Date(),
      });

      // Si se proporcionan datos del administrador, crear el usuario
      logger.info('🔍 Verificando datos del admin', {
        admin_email: data.admin_email,
        admin_password: data.admin_password ? '***' : undefined,
        admin_nombre: data.admin_nombre,
        admin_apellido: data.admin_apellido,
        cumpleCondicion: !!(data.admin_email && data.admin_password && data.admin_nombre && data.admin_apellido)
      });

      if (data.admin_email && data.admin_password && data.admin_nombre && data.admin_apellido) {
        logger.info('✅ Creando usuario administrador para establecimiento', { 
          establecimientoId: establecimiento.id,
          adminEmail: data.admin_email,
          adminNombre: data.admin_nombre,
          adminApellido: data.admin_apellido
        });

        // Obtener el rol "establecimiento"
        const rolEstablecimiento = await Role.findOne({ 
          where: { clave: 'establecimiento' } 
        });

        if (!rolEstablecimiento) {
          logger.error('No se encontró el rol "establecimiento"');
          return {
            success: false,
            error: 'Error en configuración del sistema: rol no encontrado',
          };
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(data.admin_password, 12);

        // Crear usuario administrador
        const adminUser = await User.create({
          email: data.admin_email,
          hash_contrasena: hashedPassword,
          nombre: data.admin_nombre,
          apellido: data.admin_apellido,
          rol_id: rolEstablecimiento.id,
          establecimiento_id: establecimiento.id,
          verificado: true,
          estado_usuario: EstadoUsuario.active,
          creado_el: new Date(),
          actualizado_el: new Date(),
        });

        logger.info('✅ Usuario administrador creado exitosamente', { 
          userId: adminUser.id,
          email: adminUser.email,
          establecimientoId: establecimiento.id,
          establecimiento_id_del_usuario: adminUser.establecimiento_id
        });
      } else {
        logger.warn('⚠️ No se creó usuario administrador - datos incompletos');
      }

      return {
        success: true,
        data: establecimiento,
      };
    } catch (error) {
      logger.error('Error al crear establecimiento', { error });
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
    userId: number,
    userRole?: string,
    userEstablecimientoId?: number
  ): Promise<ServiceResponse<Establecimiento>> {
    try {
      console.log('🟢 SERVICE - updateEstablecimiento llamado');
      console.log('🟢 SERVICE - Datos recibidos:', JSON.stringify(data, null, 2));
      console.log('🟢 SERVICE - User info:', { userId, userRole, userEstablecimientoId });
      
      // Verificar permisos: Admin, usuario con rol "establecimiento" de ese establecimiento, o capataz
      let tienePermiso = false;
      
      if (userRole === 'admin') {
        tienePermiso = true;
      } else if (userRole === 'establecimiento' && userEstablecimientoId === establecimientoId) {
        // Usuario con rol establecimiento puede editar su propio establecimiento
        tienePermiso = true;
      } else {
        // Verificar si es capataz del establecimiento
        const membresia = await MembresiaUsuarioEstablecimiento.findOne({
          where: {
            usuario_id: userId,
            establecimiento_id: establecimientoId,
            estado_membresia: EstadoMembresia.active,
            rol_en_establecimiento: {
              [Op.in]: [RolEnEstablecimiento.capataz]
            }
          }
        });
        
        if (membresia) {
          tienePermiso = true;
        }
      }

      if (!tienePermiso) {
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
      
      console.log('🟢 SERVICE - updatePayload antes de update:', JSON.stringify(updatePayload, null, 2));
      
      await establecimiento.update(updatePayload);

      console.log('🟢 SERVICE - Establecimiento después de update:', JSON.stringify(establecimiento.toJSON(), null, 2));

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

  /**
   * Solicitud de asociación iniciada por PROPIETARIO
   * Crea asociación con estado PENDING y notifica al establecimiento
   */
  static async asociarCaballo(
    establecimientoId: number,
    caballoId: number,
    userId: number // ID del propietario
  ): Promise<ServiceResponse<any>> {
    try {
      // Importamos dinámicamente para evitar dependencias circulares
      const { CaballoEstablecimiento } = await import('../models/CaballoEstablecimiento');
      const { PropietarioCaballo } = await import('../models/PropietarioCaballo');
      const { Caballo } = await import('../models/Caballo');
      const { EstadoAsociacionCE } = await import('../models/enums');
      const { User } = await import('../models/User');
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      const { NotificacionService, TipoNotificacion } = await import('./notificacionService');

      // 1. Verificar que el establecimiento existe
      const establecimiento = await Establecimiento.findByPk(establecimientoId);
      if (!establecimiento) {
        logger.warn('Establecimiento no encontrado', { establecimientoId });
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // 2. Verificar que el caballo existe
      const caballo = await Caballo.findByPk(caballoId);
      if (!caballo) {
        logger.warn('Caballo no encontrado', { caballoId });
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // 3. Verificar que el usuario es propietario del caballo
      const propietario = await PropietarioCaballo.findOne({
        where: {
          propietario_usuario_id: userId,
          caballo_id: caballoId,
          actual: true
        }
      });

      if (!propietario) {
        logger.warn('Usuario no es propietario del caballo', { userId, caballoId });
        return {
          success: false,
          error: 'No tienes permisos para solicitar asociación de este caballo',
        };
      }

      // 4. Verificar si ya existe una asociación activa o pendiente AL MISMO establecimiento
      const asociacionExistente = await CaballoEstablecimiento.findOne({
        where: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          estado_asociacion: [EstadoAsociacionCE.accepted, EstadoAsociacionCE.pending]
        }
      });

      if (asociacionExistente) {
        const estado = asociacionExistente.estado_asociacion === EstadoAsociacionCE.accepted 
          ? 'ya está asociado' 
          : 'tiene una solicitud pendiente';
        logger.warn('Asociación duplicada', { caballoId, establecimientoId, estado: asociacionExistente.estado_asociacion });
        return {
          success: false,
          error: `El caballo ${estado} a este establecimiento`,
        };
      }

      // 4b. Verificar si el caballo está asociado a OTRO establecimiento
      const otraAsociacionActiva = await CaballoEstablecimiento.findOne({
        where: {
          caballo_id: caballoId,
          estado_asociacion: EstadoAsociacionCE.accepted
        },
        include: [{
          model: Establecimiento,
          as: 'establecimiento',
          attributes: ['id', 'nombre']
        }]
      });

      if (otraAsociacionActiva && otraAsociacionActiva.establecimiento_id !== establecimientoId) {
        // OPCIÓN: Auto-finalizar la asociación anterior
        await CaballoEstablecimiento.update(
          { 
            estado_asociacion: EstadoAsociacionCE.finished,
            fecha_fin: new Date()
          },
          { 
            where: { 
              id: otraAsociacionActiva.id 
            } 
          }
        );
        
        logger.info(`Asociación anterior finalizada automáticamente: Caballo ${caballoId} -> Establecimiento ${otraAsociacionActiva.establecimiento_id}`);
      }

      // 5. Crear la solicitud de asociación con estado PENDING
      const asociacion = await CaballoEstablecimiento.create({
        caballo_id: caballoId,
        establecimiento_id: establecimientoId,
        estado_asociacion: EstadoAsociacionCE.pending,
        solicitante_id: userId,
        fecha_solicitud: new Date(),
        comentarios: `Solicitud iniciada por propietario`
      });

      // 6. Obtener usuarios del establecimiento que pueden aprobar (capataces y admins)
      const { RolEnEstablecimiento, EstadoMembresia } = await import('../models/enums');
      const membresiasAprobadoras = await MembresiaUsuarioEstablecimiento.findAll({
        where: {
          establecimiento_id: establecimientoId,
          rol_en_establecimiento: RolEnEstablecimiento.capataz,
          estado_membresia: EstadoMembresia.active
        }
      });

      const usuariosNotificar = membresiasAprobadoras.map((m: any) => m.usuario_id);
      
      // Incluir admins del establecimiento si existen
      const userSolicitante = await User.findByPk(userId);
      const propietarioNombre = userSolicitante?.nombre || 'Un propietario';

      // 7. Enviar notificaciones a usuarios del establecimiento
      if (usuariosNotificar.length > 0) {
        await NotificacionService.crearMultiple(
          usuariosNotificar,
          {
            tipo: TipoNotificacion.CABALLO_SOLICITUD_ASOCIACION,
            titulo: 'Nueva solicitud de asociación',
            mensaje: `${propietarioNombre} solicita asociar el caballo "${caballo.nombre}" a ${establecimiento.nombre}`,
            payload_json: {
              caballo_id: caballoId,
              establecimiento_id: establecimientoId,
              asociacion_id: asociacion.id,
              solicitante_id: userId,
              caballo_nombre: caballo.nombre,
              establecimiento_nombre: establecimiento.nombre
            },
            importante: true
          }
        );
      }

      return {
        success: true,
        data: {
          ...asociacion.toJSON(),
          mensaje: 'Solicitud enviada. Esperando aprobación del establecimiento.'
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error al solicitar asociación del caballo',
      };
    }
  }

  /**
   * Solicitud de asociación iniciada por ESTABLECIMIENTO
   * Crea asociación con estado PENDING y notifica al propietario del caballo
   */
  static async solicitarCaballo(
    establecimientoId: number,
    caballoId: number,
    userId: number // ID del capataz/admin del establecimiento
  ): Promise<ServiceResponse<any>> {
    try {
      // Importamos dinámicamente para evitar dependencias circulares
      const { CaballoEstablecimiento } = await import('../models/CaballoEstablecimiento');
      const { PropietarioCaballo } = await import('../models/PropietarioCaballo');
      const { Caballo } = await import('../models/Caballo');
      const { EstadoAsociacionCE, RolEnEstablecimiento, EstadoMembresia } = await import('../models/enums');
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      const { NotificacionService, TipoNotificacion } = await import('./notificacionService');

      // 1. Verificar que el establecimiento existe
      const establecimiento = await Establecimiento.findByPk(establecimientoId);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // 2. Verificar que el usuario tiene permisos en el establecimiento (capataz o admin)
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          establecimiento_id: establecimientoId,
          usuario_id: userId,
          rol_en_establecimiento: RolEnEstablecimiento.capataz, // Solo capataces pueden solicitar
          estado_membresia: EstadoMembresia.active
        }
      });

      if (!membresia) {
        return {
          success: false,
          error: 'No tienes permisos para solicitar caballos en este establecimiento',
        };
      }

      // 3. Verificar que el caballo existe
      const caballo = await Caballo.findByPk(caballoId);
      if (!caballo) {
        return {
          success: false,
          error: 'Caballo no encontrado',
        };
      }

      // 4. Obtener propietario actual del caballo
      const propietario = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          actual: true
        }
      });

      if (!propietario) {
        return {
          success: false,
          error: 'No se encontró propietario para este caballo',
        };
      }

      // 5. Verificar si ya existe una asociación activa o pendiente
      const asociacionExistente = await CaballoEstablecimiento.findOne({
        where: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          estado_asociacion: [EstadoAsociacionCE.accepted, EstadoAsociacionCE.pending]
        }
      });

      if (asociacionExistente) {
        const estado = asociacionExistente.estado_asociacion === EstadoAsociacionCE.accepted 
          ? 'ya está asociado' 
          : 'tiene una solicitud pendiente';
        return {
          success: false,
          error: `El caballo ${estado} a este establecimiento`,
        };
      }

      // 6. Crear la solicitud de asociación con estado PENDING
      const asociacion = await CaballoEstablecimiento.create({
        caballo_id: caballoId,
        establecimiento_id: establecimientoId,
        estado_asociacion: EstadoAsociacionCE.pending,
        solicitante_id: userId,
        fecha_solicitud: new Date(),
        comentarios: `Solicitud iniciada por establecimiento`
      });

      // 7. Enviar notificación al propietario del caballo
      await NotificacionService.crear({
        usuario_id: propietario.propietario_usuario_id,
        tipo: TipoNotificacion.CABALLO_SOLICITUD_ASOCIACION,
        titulo: 'Solicitud de asociación para tu caballo',
        mensaje: `${establecimiento.nombre} solicita asociar tu caballo "${caballo.nombre}"`,
        payload_json: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          asociacion_id: asociacion.id,
          solicitante_id: userId,
          caballo_nombre: caballo.nombre,
          establecimiento_nombre: establecimiento.nombre
        },
        importante: true
      });

      return {
        success: true,
        data: {
          ...asociacion.toJSON(),
          mensaje: 'Solicitud enviada. Esperando aprobación del propietario.'
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error al solicitar el caballo',
      };
    }
  }

  /**
   * Aprobar una solicitud de asociación (genérico para ambas direcciones)
   * Valida que solo el receptor de la solicitud puede aprobar
   */
  static async aprobarAsociacion(
    establecimientoId: number,
    caballoId: number,
    userId: number // ID del usuario que aprueba
  ): Promise<ServiceResponse<any>> {
    try {
      const { CaballoEstablecimiento } = await import('../models/CaballoEstablecimiento');
      const { PropietarioCaballo } = await import('../models/PropietarioCaballo');
      const { Caballo } = await import('../models/Caballo');
      const { EstadoAsociacionCE, RolEnEstablecimiento, EstadoMembresia } = await import('../models/enums');
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      const { NotificacionService, TipoNotificacion } = await import('./notificacionService');

      // 1. Buscar la solicitud pendiente
      const asociacion = await CaballoEstablecimiento.findOne({
        where: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          estado_asociacion: EstadoAsociacionCE.pending
        }
      });

      if (!asociacion) {
        return {
          success: false,
          error: 'No se encontró solicitud pendiente para esta asociación',
        };
      }

      // 2. Determinar quién solicitó y validar permisos del aprobador
      const solicitanteId = asociacion.get('solicitante_id') || (asociacion as any).solicitante_id;
      
      // 2a. Verificar si el solicitante fue un propietario (entonces el aprobador debe ser del establecimiento)
      const propietario = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          propietario_usuario_id: solicitanteId!,
          actual: true
        }
      });

      if (propietario) {
        // Solicitud iniciada por PROPIETARIO → debe aprobar ESTABLECIMIENTO
        const membresia = await MembresiaUsuarioEstablecimiento.findOne({
          where: {
            establecimiento_id: establecimientoId,
            usuario_id: userId,
            rol_en_establecimiento: RolEnEstablecimiento.capataz,
            estado_membresia: EstadoMembresia.active
          }
        });

        if (!membresia) {
          return {
            success: false,
            error: 'No tienes permisos para aprobar esta solicitud (solo capataces del establecimiento)',
          };
        }
      } else {
        // Solicitud iniciada por ESTABLECIMIENTO → debe aprobar PROPIETARIO
        const propietarioAprobador = await PropietarioCaballo.findOne({
          where: {
            caballo_id: caballoId,
            propietario_usuario_id: userId,
            actual: true
          }
        });

        if (!propietarioAprobador) {
          return {
            success: false,
            error: 'No tienes permisos para aprobar esta solicitud (solo propietario del caballo)',
          };
        }
      }

      // 3. No permitir auto-aprobación
      if (solicitanteId === userId) {
        return {
          success: false,
          error: 'No puedes aprobar tu propia solicitud',
        };
      }

      // 4. Aprobar la asociación
      await asociacion.update({
        estado_asociacion: EstadoAsociacionCE.accepted,
        aprobador_id: userId,
        fecha_respuesta: new Date(),
        fecha_inicio: new Date(),
        comentarios: `${asociacion.comentarios || ''} | Aprobada por usuario ${userId}`
      });

      // 5. Obtener información para notificación
      const caballo = await Caballo.findByPk(caballoId);
      const establecimiento = await Establecimiento.findByPk(establecimientoId);

      // 6. Notificar al solicitante de la aprobación
      await NotificacionService.crear({
        usuario_id: solicitanteId!,
        tipo: TipoNotificacion.CABALLO_ASOCIACION_APROBADA,
        titulo: '¡Solicitud aprobada!',
        mensaje: `Tu solicitud para asociar "${caballo?.nombre}" con "${establecimiento?.nombre}" ha sido aprobada`,
        payload_json: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          asociacion_id: asociacion.id,
          aprobador_id: userId,
          caballo_nombre: caballo?.nombre,
          establecimiento_nombre: establecimiento?.nombre
        },
        importante: true
      });

      return {
        success: true,
        data: {
          ...asociacion.toJSON(),
          mensaje: 'Asociación aprobada exitosamente'
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error al aprobar la asociación',
      };
    }
  }

  /**
   * Rechazar una solicitud de asociación (genérico para ambas direcciones)
   * Valida que solo el receptor de la solicitud puede rechazar
   */
  static async rechazarAsociacion(
    establecimientoId: number,
    caballoId: number,
    userId: number, // ID del usuario que rechaza
    motivo?: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { CaballoEstablecimiento } = await import('../models/CaballoEstablecimiento');
      const { PropietarioCaballo } = await import('../models/PropietarioCaballo');
      const { Caballo } = await import('../models/Caballo');
      const { EstadoAsociacionCE, RolEnEstablecimiento, EstadoMembresia } = await import('../models/enums');
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      const { NotificacionService, TipoNotificacion } = await import('./notificacionService');

      // 1. Buscar la solicitud pendiente
      const asociacion = await CaballoEstablecimiento.findOne({
        where: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          estado_asociacion: EstadoAsociacionCE.pending
        }
      });

      if (!asociacion) {
        return {
          success: false,
          error: 'No se encontró solicitud pendiente para esta asociación',
        };
      }

      // 2. Determinar quién solicitó y validar permisos
      const solicitanteId = asociacion.get('solicitante_id') || (asociacion as any).solicitante_id;
      
      // 2a. Verificar si el solicitante fue un propietario
      const propietario = await PropietarioCaballo.findOne({
        where: {
          caballo_id: caballoId,
          propietario_usuario_id: solicitanteId!,
          actual: true
        }
      });

      if (propietario) {
        // Solicitud iniciada por PROPIETARIO → debe rechazar ESTABLECIMIENTO
        const membresia = await MembresiaUsuarioEstablecimiento.findOne({
          where: {
            establecimiento_id: establecimientoId,
            usuario_id: userId,
            rol_en_establecimiento: RolEnEstablecimiento.capataz,
            estado_membresia: EstadoMembresia.active
          }
        });

        if (!membresia) {
          return {
            success: false,
            error: 'No tienes permisos para rechazar esta solicitud',
          };
        }
      } else {
        // Solicitud iniciada por ESTABLECIMIENTO → debe rechazar PROPIETARIO
        const propietarioRechazo = await PropietarioCaballo.findOne({
          where: {
            caballo_id: caballoId,
            propietario_usuario_id: userId,
            actual: true
          }
        });

        if (!propietarioRechazo) {
          return {
            success: false,
            error: 'No tienes permisos para rechazar esta solicitud',
          };
        }
      }

      // 3. Rechazar la asociación
      await asociacion.update({
        estado_asociacion: EstadoAsociacionCE.rejected,
        aprobador_id: userId,
        fecha_respuesta: new Date(),
        comentarios: `${asociacion.comentarios || ''} | Rechazada${motivo ? `: ${motivo}` : ''}`
      });

      // 4. Obtener información para notificación
      const caballo = await Caballo.findByPk(caballoId);
      const establecimiento = await Establecimiento.findByPk(establecimientoId);

      // 5. Notificar al solicitante del rechazo
      await NotificacionService.crear({
        usuario_id: solicitanteId!,
        tipo: TipoNotificacion.CABALLO_ASOCIACION_RECHAZADA,
        titulo: 'Solicitud rechazada',
        mensaje: `Tu solicitud para asociar "${caballo?.nombre}" con "${establecimiento?.nombre}" fue rechazada${motivo ? `: ${motivo}` : ''}`,
        payload_json: {
          caballo_id: caballoId,
          establecimiento_id: establecimientoId,
          asociacion_id: asociacion.id,
          rechazado_por: userId,
          motivo: motivo || '',
          caballo_nombre: caballo?.nombre,
          establecimiento_nombre: establecimiento?.nombre
        },
        importante: true
      });

      return {
        success: true,
        data: {
          ...asociacion.toJSON(),
          mensaje: 'Solicitud rechazada'
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Error al rechazar la asociación',
      };
    }
  }

  // ============================================================================
  // NUEVOS MÉTODOS: Geolocalización, Reseñas e Imágenes
  // ============================================================================

  /**
   * Obtener establecimientos para mapa (solo los que tienen coordenadas)
   */
  static async getEstablecimientosForMap(filters: {
    tipo?: string;
    rating_minimo?: number;
    verificado?: boolean;
  }): Promise<ServiceResponse<any[]>> {
    try {
      const where: any = {
        latitud: { [Op.ne]: null },
        longitud: { [Op.ne]: null },
        estado: 'activo',
      };

      if (filters.tipo) {
        where.tipo_establecimiento = filters.tipo;
      }

      if (filters.rating_minimo) {
        where.rating_promedio = { [Op.gte]: filters.rating_minimo };
      }

      if (filters.verificado !== undefined) {
        where.verificado = filters.verificado;
      }

      const establecimientos = await Establecimiento.findAll({
        where,
        attributes: [
          'id',
          'nombre',
          'latitud',
          'longitud',
          'rating_promedio',
          'total_resenas',
          'verificado',
          'tipo_establecimiento',
          'logo_url',
          'ciudad',
          'provincia',
          'imagenes',
        ],
        limit: 500, // Limitar para no sobrecargar el mapa
      });

      return {
        success: true,
        data: establecimientos.map(e => e.toJSON()),
      };
    } catch (error: any) {
      logger.error('Error obteniendo establecimientos para mapa', { error });
      return {
        success: false,
        error: error?.message || 'Error obteniendo establecimientos',
      };
    }
  }

  /**
   * Crear una reseña para un establecimiento
   */
  static async createResena(data: {
    establecimiento_id: number;
    usuario_id: number;
    rating: number;
    comentario: string | null;
  }): Promise<ServiceResponse<any>> {
    try {
      const { EstablecimientoResena } = require('../models/EstablecimientoResena');

      // Verificar que el establecimiento existe
      const establecimiento = await Establecimiento.findByPk(data.establecimiento_id);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Crear o actualizar la reseña
      const [resena] = await EstablecimientoResena.upsert({
        establecimiento_id: data.establecimiento_id,
        usuario_id: data.usuario_id,
        rating: data.rating,
        comentario: data.comentario,
        visible: true,
        actualizado_el: new Date(),
      }, {
        returning: true,
      });

      return {
        success: true,
        data: resena.toJSON(),
      };
    } catch (error: any) {
      logger.error('Error creando reseña', { error });
      return {
        success: false,
        error: error?.message || 'Error creando reseña',
      };
    }
  }

  /**
   * Obtener reseñas de un establecimiento
   */
  static async getResenas(
    establecimientoId: number,
    options: {
      page?: number;
      limit?: number;
      rating?: number;
    }
  ): Promise<ServiceResponse<{ resenas: any[]; total: number; totalPages: number }>> {
    try {
      const { EstablecimientoResena } = require('../models/EstablecimientoResena');
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;

      const where: any = {
        establecimiento_id: establecimientoId,
        visible: true,
      };

      if (options.rating) {
        where.rating = options.rating;
      }

      const { count, rows } = await EstablecimientoResena.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'usuario',
            attributes: ['id', 'nombre', 'apellido', 'avatar_url'],
          },
          {
            model: User,
            as: 'respondido_por',
            attributes: ['id', 'nombre', 'apellido'],
            required: false,
          },
        ],
        order: [['creado_el', 'DESC']],
        limit,
        offset,
      });

      return {
        success: true,
        data: {
          resenas: rows.map((r: any) => r.toJSON()),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error: any) {
      logger.error('Error obteniendo reseñas', { error });
      return {
        success: false,
        error: error?.message || 'Error obteniendo reseñas',
      };
    }
  }

  /**
   * Responder a una reseña (solo roles del establecimiento)
   */
  static async responderResena(
    resenaId: number,
    establecimientoId: number,
    usuarioId: number,
    respuesta: string
  ): Promise<ServiceResponse<any>> {
    try {
      const { EstablecimientoResena } = require('../models/EstablecimientoResena');

      // Verificar que el usuario pertenece al establecimiento
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          usuario_id: usuarioId,
          establecimiento_id: establecimientoId,
          estado_membresia: EstadoMembresia.active,
        },
      });

      if (!membresia) {
        return {
          success: false,
          error: 'No tienes permisos para responder reseñas de este establecimiento',
        };
      }

      const resena = await EstablecimientoResena.findOne({
        where: {
          id: resenaId,
          establecimiento_id: establecimientoId,
        },
      });

      if (!resena) {
        return {
          success: false,
          error: 'Reseña no encontrada',
        };
      }

      resena.respuesta_establecimiento = respuesta;
      resena.respondido_por_usuario_id = usuarioId;
      resena.respondido_el = new Date();
      resena.actualizado_el = new Date();
      await resena.save();

      return {
        success: true,
        data: resena.toJSON(),
      };
    } catch (error: any) {
      logger.error('Error respondiendo reseña', { error });
      return {
        success: false,
        error: error?.message || 'Error respondiendo reseña',
      };
    }
  }

  /**
   * Agregar imágenes al establecimiento
   */
  static async addImagenes(
    establecimientoId: number,
    usuarioId: number,
    imageUrls: string[]
  ): Promise<ServiceResponse<any>> {
    try {
      // Verificar permisos
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          usuario_id: usuarioId,
          establecimiento_id: establecimientoId,
          estado_membresia: EstadoMembresia.active,
        },
      });

      if (!membresia) {
        return {
          success: false,
          error: 'No tienes permisos para agregar imágenes a este establecimiento',
        };
      }

      const establecimiento = await Establecimiento.findByPk(establecimientoId);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Agregar nuevas imágenes al array existente
      const imagenesActuales = establecimiento.imagenes || [];
      establecimiento.imagenes = [...imagenesActuales, ...imageUrls];
      establecimiento.actualizado_el = new Date();
      await establecimiento.save();

      return {
        success: true,
        data: establecimiento.toJSON(),
      };
    } catch (error: any) {
      logger.error('Error agregando imágenes', { error });
      return {
        success: false,
        error: error?.message || 'Error agregando imágenes',
      };
    }
  }

  /**
   * Eliminar una imagen del establecimiento
   */
  static async deleteImagen(
    establecimientoId: number,
    usuarioId: number,
    imagenUrl: string
  ): Promise<ServiceResponse<any>> {
    try {
      // Verificar permisos
      const membresia = await MembresiaUsuarioEstablecimiento.findOne({
        where: {
          usuario_id: usuarioId,
          establecimiento_id: establecimientoId,
          estado_membresia: EstadoMembresia.active,
        },
      });

      if (!membresia) {
        return {
          success: false,
          error: 'No tienes permisos para eliminar imágenes de este establecimiento',
        };
      }

      const establecimiento = await Establecimiento.findByPk(establecimientoId);
      if (!establecimiento) {
        return {
          success: false,
          error: 'Establecimiento no encontrado',
        };
      }

      // Filtrar la imagen a eliminar
      establecimiento.imagenes = (establecimiento.imagenes || []).filter(
        (url: string) => url !== imagenUrl
      );
      establecimiento.actualizado_el = new Date();
      await establecimiento.save();

      return {
        success: true,
        data: establecimiento.toJSON(),
      };
    } catch (error: any) {
      logger.error('Error eliminando imagen', { error });
      return {
        success: false,
        error: error?.message || 'Error eliminando imagen',
      };
    }
  }
}