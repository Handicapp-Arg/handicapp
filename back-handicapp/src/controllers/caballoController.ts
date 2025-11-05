// src/controllers/caballoController.ts
// -----------------------------------------------------------------------------
// HandicApp API - Controller de Caballos
// -----------------------------------------------------------------------------

import { Response } from 'express';
import { CaballoService } from '../services/caballoService';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { uploadImageBufferToCloudinary } from '../utils/imageUpload';

export class CaballoController {

  // ====================================
  // CRUD BÁSICO
  // ====================================

  /**
   * Crear nuevo caballo
   * POST /api/v1/caballos
   * Roles: admin, establecimiento, propietario, veterinario
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        nombre,
        raza,
        sexo,
        fecha_nacimiento,
        pelaje,
        disciplina,
        microchip,
        foto_url,
        establecimiento_id,
        padre_id,
        madre_id,
        // Nuevos campos de documentación
        rp,
        sba,
        adn,
        pasaporte,
        numero_fei,
        ueln,
        // Nuevos campos físicos
        altura,
        peso,
      } = req.body;
      
      const usuarioId = req.user!.id;

      // LOG: Ver qué llega del frontend
      logger.debug('Payload recibido para crear caballo:', { 
        nombre, 
        microchip: microchip || 'VACIO/NULL', 
        microchipType: typeof microchip,
        sexo, 
        fecha_nacimiento 
      });

      // Validaciones básicas
      if (!nombre || !sexo || !fecha_nacimiento) {
        res.status(400).json(ApiResponse.error('Nombre, sexo y fecha de nacimiento son requeridos'));
        return;
      }

      // Normalizar y validar datos opcionales
      const safe = {
        nombre: String(nombre).trim(),
        sexo: String(sexo).trim(),
        fecha_nacimiento: new Date(fecha_nacimiento),
        raza: raza ? String(raza).trim() || null : null,
        pelaje: pelaje ? String(pelaje).trim() || null : null,
        disciplina: disciplina ? String(disciplina).trim() || null : null,
        // IMPORTANTE: microchip vacío debe ser null, no string vacío, para evitar colisión en índice único
        microchip: (microchip && String(microchip).trim()) ? String(microchip).trim() : null,
        foto_url: foto_url ? String(foto_url).trim() || null : null,
        establecimiento_id: establecimiento_id ? Number(establecimiento_id) : undefined,
        padre_id: padre_id ? Number(padre_id) : undefined,
        madre_id: madre_id ? Number(madre_id) : undefined,
        // Documentación oficial
        rp: rp && String(rp).trim() ? String(rp).trim() : null,
        sba: sba && String(sba).trim() ? String(sba).trim() : null,
        adn: adn && String(adn).trim() ? String(adn).trim() : null,
        pasaporte: pasaporte && String(pasaporte).trim() ? String(pasaporte).trim() : null,
        numero_fei: numero_fei && String(numero_fei).trim() ? String(numero_fei).trim() : null,
        ueln: ueln && String(ueln).trim() ? String(ueln).trim() : null,
        // Datos físicos
        altura: altura ? Number(altura) : null,
        peso: peso ? Number(peso) : null,
      } as any;

      if (isNaN(safe.fecha_nacimiento.getTime())) {
        res.status(400).json(ApiResponse.error('Fecha de nacimiento inválida'));
        return;
      }

      const createResult = await CaballoService.createCaballo({
  nombre: safe.nombre,
  raza: safe.raza,
  sexo: safe.sexo,
  fecha_nacimiento: safe.fecha_nacimiento,
  pelaje: safe.pelaje,
  disciplina: safe.disciplina,
  microchip: safe.microchip,
  foto_url: safe.foto_url,
  establecimiento_id: safe.establecimiento_id,
  padre_id: safe.padre_id,
  madre_id: safe.madre_id,
        // Documentación oficial
        rp: safe.rp,
        sba: safe.sba,
        adn: safe.adn,
        pasaporte: safe.pasaporte,
        numero_fei: safe.numero_fei,
        ueln: safe.ueln,
        // Datos físicos
        altura: safe.altura,
        peso: safe.peso,
        creadoPorUsuarioId: usuarioId
      });

      if (!createResult.success || !createResult.data) {
        res.status(400).json(ApiResponse.error(createResult.error || 'No se pudo crear el caballo'));
        return;
      }

      let payload = createResult.data;

      // Si vino una imagen (multer memory), subir a Cloudinary y actualizar foto_url
      const file = (req as any).file as Express.Multer.File | undefined;
      if (file && file.buffer) {
        const folder = `handicapp/caballos/${createResult.data.id}/main`;
        const cloud = await uploadImageBufferToCloudinary(file.buffer, file.originalname || 'foto', {
          folder,
          publicId: 'main',
          overwrite: true,
        });
        if (cloud.success && (cloud.secureUrl || cloud.url)) {
          const fotoUrl = cloud.secureUrl || cloud.url || '';
          const updated = await CaballoService.updateCaballo(createResult.data.id, { foto_url: fotoUrl }, usuarioId, req.user!.rol?.clave);
          if (updated) {
            payload = updated as any;
          }
        } else {
          logger.warn('Subida de foto de caballo fallida, se crea el caballo sin foto_url', { id: createResult.data.id, error: cloud.error });
        }
      }

      logger.info(`Caballo creado: ${createResult.data.id} - ${createResult.data.nombre}`);
      res.status(201).json(ApiResponse.success(payload, 'Caballo creado exitosamente'));

    } catch (error: any) {
      logger.error('Error creando caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener todos los caballos con paginación y filtros
   * GET /api/v1/caballos?page=1&limit=10&search=nombre&establecimiento=1&raza=SPC
   * Roles: todos los autenticados
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const page = parseInt((req.query['page'] as string) || '') || 1;
  const limit = parseInt((req.query['limit'] as string) || '') || 10;
  const search = req.query['search'] as string | undefined;
  const establecimientoId = req.query['establecimiento'] ? parseInt(req.query['establecimiento'] as string) : undefined;
  const raza = req.query['raza'] as string | undefined;
  const sexo = req.query['sexo'] as string | undefined;
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const filterPayload: any = { page, limit, usuarioId, userRole };
      if (search) filterPayload.search = search;
      if (establecimientoId) filterPayload.establecimientoId = establecimientoId;
      if (raza) filterPayload.raza = raza;
      if (sexo) filterPayload.sexo = sexo;

      const result = await CaballoService.getAllCaballos(filterPayload);

      if (!result.success || !result.data) {
        res.status(500).json(ApiResponse.error(result.error || 'Error al obtener caballos'));
        return;
      }

      // Evitar cache mientras desarrollamos para que no responda 304 Not Modified
      res.set('Cache-Control', 'no-store');

      // Devolver estructura consistente con el frontend: { data: { caballos, total, totalPages } }
      res.json({
        success: true,
        message: 'Success',
        data: result.data,
        meta: { page, limit, total: result.data.total, totalPages: result.data.totalPages },
      });

    } catch (error: any) {
      logger.error('Error obteniendo caballos', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener caballo por ID
   * GET /api/v1/caballos/:id
   * Roles: usuarios con acceso al caballo
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const result = await CaballoService.getCaballoById(caballoId, usuarioId, userRole);

      if (!result.success || !result.data) {
        res.status(404).json(ApiResponse.error(result.error || 'Caballo no encontrado'));
        return;
      }

      res.json(ApiResponse.success(result.data));

    } catch (error: any) {
      logger.error('Error obteniendo caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar caballo
   * PUT /api/v1/caballos/:id
   * Roles: admin, propietario del caballo, veterinario autorizado
   */
  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const raw = req.body || {};

      // Normalizar datos (mismo criterio que en create)
      const updateData: any = {
        ...(raw.nombre !== undefined ? { nombre: String(raw.nombre).trim() } : {}),
        ...(raw.sexo !== undefined ? { sexo: String(raw.sexo).trim() } : {}),
        ...(raw.fecha_nacimiento !== undefined ? { fecha_nacimiento: raw.fecha_nacimiento ? new Date(raw.fecha_nacimiento) : null } : {}),
        ...(raw.pelaje !== undefined ? { pelaje: raw.pelaje ? String(raw.pelaje).trim() : null } : {}),
        ...(raw.raza !== undefined ? { raza: raw.raza ? String(raw.raza).trim() : null } : {}),
        ...(raw.disciplina !== undefined ? { disciplina: raw.disciplina ? String(raw.disciplina).trim() : null } : {}),
        ...(raw.microchip !== undefined ? { microchip: raw.microchip && String(raw.microchip).trim() ? String(raw.microchip).trim() : null } : {}),
        ...(raw.foto_url !== undefined ? { foto_url: raw.foto_url ? String(raw.foto_url).trim() : null } : {}),
        ...(raw.padre_id !== undefined ? { padre_id: raw.padre_id ? Number(raw.padre_id) : null } : {}),
        ...(raw.madre_id !== undefined ? { madre_id: raw.madre_id ? Number(raw.madre_id) : null } : {}),
        // Documentación oficial
        ...(raw.rp !== undefined ? { rp: raw.rp && String(raw.rp).trim() ? String(raw.rp).trim() : null } : {}),
        ...(raw.sba !== undefined ? { sba: raw.sba && String(raw.sba).trim() ? String(raw.sba).trim() : null } : {}),
        ...(raw.adn !== undefined ? { adn: raw.adn && String(raw.adn).trim() ? String(raw.adn).trim() : null } : {}),
        ...(raw.pasaporte !== undefined ? { pasaporte: raw.pasaporte && String(raw.pasaporte).trim() ? String(raw.pasaporte).trim() : null } : {}),
        ...(raw.numero_fei !== undefined ? { numero_fei: raw.numero_fei && String(raw.numero_fei).trim() ? String(raw.numero_fei).trim() : null } : {}),
        ...(raw.ueln !== undefined ? { ueln: raw.ueln && String(raw.ueln).trim() ? String(raw.ueln).trim() : null } : {}),
        // Datos físicos
        ...(raw.altura !== undefined ? { altura: raw.altura ? Number(raw.altura) : null } : {}),
        ...(raw.peso !== undefined ? { peso: raw.peso ? Number(raw.peso) : null } : {}),
      };

      logger.info('CaballoController.update payload', {
        caballoId,
        updateKeys: Object.keys(updateData),
        microchip: updateData.microchip,
        foto_url: updateData.foto_url,
      });

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const caballo = await CaballoService.updateCaballo(
        caballoId,
        updateData,
        usuarioId,
        userRole
      );

      if (!caballo) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

  logger.info(`Caballo actualizado: ${caballoId}`);
    // Evitar cache del resultado de actualización
    res.set('Cache-Control', 'no-store');
    // Asegurar objeto plano en respuesta
    const plain = (caballo as any)?.get ? (caballo as any).get({ plain: true }) : caballo;
    res.json(ApiResponse.success(plain, 'Caballo actualizado exitosamente'));

    } catch (error: any) {
      logger.error('Error actualizando caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Eliminar caballo (soft delete)
   * DELETE /api/v1/caballos/:id
   * Roles: admin únicamente
   */
  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
  const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      // Solo admins pueden eliminar caballos
      if (userRole !== 'admin') {
        res.status(403).json(ApiResponse.error('No tiene permisos para eliminar caballos'));
        return;
      }

      const success = await CaballoService.deleteCaballo(caballoId);

      if (!success) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado'));
        return;
      }

  logger.info(`Caballo eliminado: ${caballoId}`);
      res.json(ApiResponse.success(null, 'Caballo eliminado exitosamente'));

    } catch (error: any) {
      logger.error('Error eliminando caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GESTIÓN DE PROPIETARIOS
  // ====================================

  /**
   * Agregar propietario a caballo
   * POST /api/v1/caballos/:id/propietarios
   * Roles: admin, propietario actual del caballo
   */
  static async addPropietario(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const { propietarioId, fechaInicio, porcentaje } = req.body;
      

      if (isNaN(caballoId) || !propietarioId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: propietarioId'));
        return;
      }

      const propietario = await CaballoService.addPropietarioToCaballo(
        caballoId,
        propietarioId,
        fechaInicio,
        porcentaje || 100
      );

      if (!propietario) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

  logger.info(`Propietario ${propietarioId} agregado a caballo ${caballoId}`);
      res.status(201).json(ApiResponse.success(propietario, 'Propietario agregado al caballo exitosamente'));

    } catch (error: any) {
      logger.error('Error agregando propietario a caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener propietarios del caballo (solo actuales)
   * GET /api/v1/caballos/:id/propietarios
   * Roles: usuarios con acceso al caballo
   */
  static async getPropietarios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const result = await CaballoService.getCaballoPropietarios(
        caballoId,
        usuarioId,
        userRole
      );

      if (!result.success) {
        res.status(404).json(ApiResponse.error(result.error || 'Caballo no encontrado o sin permisos'));
        return;
      }

      const propietariosPlain = result.data!.map(p => p.get({ plain: true }));
      res.json(ApiResponse.success(propietariosPlain));

    } catch (error: any) {
      logger.error('Error obteniendo propietarios del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener historial completo de propietarios (actuales + históricos)
   * GET /api/v1/caballos/:id/propietarios/historial
   * Roles: usuarios con acceso al caballo
   */
  static async getHistorialPropietarios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const result = await CaballoService.getHistorialPropietarios(
        caballoId,
        usuarioId,
        userRole
      );

      if (!result.success) {
        res.status(404).json(ApiResponse.error(result.error || 'Caballo no encontrado o sin permisos'));
        return;
      }

      const propietariosPlain = result.data!.map(p => p.get({ plain: true }));
      res.json(ApiResponse.success(propietariosPlain));

    } catch (error: any) {
      logger.error('Error obteniendo historial de propietarios', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Actualizar datos de propiedad
   * PATCH /api/v1/caballos/:id/propietarios/:propietarioId
   * Roles: admin, propietario actual del caballo
   */
  static async updatePropietario(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] as string);
      const propietarioId = parseInt(req.params['propietarioId'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const { porcentaje_tenencia, fecha_inicio, fecha_fin, actual } = req.body;

      if (isNaN(caballoId) || isNaN(propietarioId)) {
        res.status(400).json(ApiResponse.error('IDs inválidos'));
        return;
      }

      const result = await CaballoService.updatePropietario(
        caballoId,
        propietarioId,
        { porcentaje_tenencia, fecha_inicio, fecha_fin, actual },
        usuarioId,
        userRole
      );

      if (!result.success) {
        res.status(404).json(ApiResponse.error(result.error || 'Error actualizando propietario'));
        return;
      }

      const propietarioPlain = result.data!.get({ plain: true });
      res.json(ApiResponse.success(propietarioPlain, 'Propietario actualizado exitosamente'));

    } catch (error: any) {
      logger.error('Error actualizando propietario', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Finalizar propiedad (marcar como histórico)
   * DELETE /api/v1/caballos/:id/propietarios/:propietarioId
   * Roles: admin, propietario actual del caballo
   */
  static async removePropietario(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] as string);
      const propietarioId = parseInt(req.params['propietarioId'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;
      const { fecha_fin } = req.body;

      if (isNaN(caballoId) || isNaN(propietarioId)) {
        res.status(400).json(ApiResponse.error('IDs inválidos'));
        return;
      }

      const result = await CaballoService.removePropietario(
        caballoId,
        propietarioId,
        fecha_fin ? new Date(fecha_fin) : undefined,
        usuarioId,
        userRole
      );

      if (!result.success) {
        res.status(404).json(ApiResponse.error(result.error || 'Error finalizando propiedad'));
        return;
      }

      const propietarioPlain = result.data!.get({ plain: true });
      res.json(ApiResponse.success(propietarioPlain, 'Propiedad finalizada exitosamente'));

    } catch (error: any) {
      logger.error('Error finalizando propiedad', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // GENEALOGÍA
  // ====================================

  /**
   * Obtener pedigrí del caballo
   * GET /api/v1/caballos/:id/pedigree?generations=3
   * Roles: usuarios con acceso al caballo
   */
  static async getPedigree(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
    const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const pedigree = await CaballoService.getCaballoPedigree(
        caballoId,
        usuarioId,
        userRole
      );

      if (!pedigree) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(pedigree));

    } catch (error: any) {
      logger.error('Error obteniendo pedigrí del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener descendencia del caballo
   * GET /api/v1/caballos/:id/descendencia
   * Roles: usuarios con acceso al caballo
   */
  static async getDescendencia(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const descendencia = await CaballoService.getCaballoDescendencia(
        caballoId,
        usuarioId,
        userRole
      );

      if (!descendencia) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(descendencia));

    } catch (error: any) {
      logger.error('Error obteniendo descendencia del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // HISTORIAL MÉDICO
  // ====================================

  /**
   * Obtener historial médico del caballo
   * GET /api/v1/caballos/:id/historial-medico
   * Roles: propietario, veterinario autorizado
   */
  static async getHistorialMedico(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const historial = await CaballoService.getCaballoHistorialMedico(
        caballoId,
        usuarioId,
        userRole
      );

      if (!historial) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(historial));

    } catch (error: any) {
      logger.error('Error obteniendo historial médico del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // CAMBIO DE ESTABLECIMIENTO
  // ====================================

  /**
   * Mover caballo a otro establecimiento
   * POST /api/v1/caballos/:id/mover-establecimiento
   * Roles: admin, propietario del caballo
   */
  static async moverEstablecimiento(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
  const { nuevoEstablecimientoId } = req.body;
  const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId) || !nuevoEstablecimientoId) {
        res.status(400).json(ApiResponse.error('Datos requeridos: nuevoEstablecimientoId'));
        return;
      }

      const resultado = await CaballoService.moverCaballoEstablecimiento(
        caballoId,
        nuevoEstablecimientoId,
        usuarioId,
        userRole
      );

      if (!resultado) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      logger.info(`Caballo ${caballoId} movido a establecimiento ${nuevoEstablecimientoId}`);
      res.json(ApiResponse.success(resultado, 'Caballo movido exitosamente'));

    } catch (error: any) {
      logger.error('Error moviendo caballo de establecimiento', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  // ====================================
  // ESTADÍSTICAS
  // ====================================

  /**
   * Obtener estadísticas del caballo
   * GET /api/v1/caballos/:id/estadisticas
   * Roles: usuarios con acceso al caballo
   */
  static async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
  const caballoId = parseInt(req.params['id'] as string);
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      if (isNaN(caballoId)) {
        res.status(400).json(ApiResponse.error('ID de caballo inválido'));
        return;
      }

      const stats = await CaballoService.getCaballoStats(
        caballoId,
        usuarioId,
        userRole
      );

      if (!stats) {
        res.status(404).json(ApiResponse.error('Caballo no encontrado o sin permisos'));
        return;
      }

      res.json(ApiResponse.success(stats));

    } catch (error: any) {
      logger.error('Error obteniendo estadísticas del caballo', { error });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }

  /**
   * Obtener solicitudes pendientes de asociación para el usuario actual
   * GET /api/v1/caballos/solicitudes-pendientes
   * Retorna solicitudes donde el usuario es el receptor (debe aprobar/rechazar)
   */
  static async getSolicitudesPendientes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user!.id;
      const userRole = req.user!.rol?.clave;

      const { CaballoEstablecimiento } = await import('../models/CaballoEstablecimiento');
      const { PropietarioCaballo } = await import('../models/PropietarioCaballo');
      const { MembresiaUsuarioEstablecimiento } = await import('../models/MembresiaUsuarioEstablecimiento');
      const { Caballo } = await import('../models/Caballo');
      const { Establecimiento } = await import('../models/Establecimiento');
      const { User } = await import('../models/User');
      const { EstadoAsociacionCE, EstadoMembresia, RolEnEstablecimiento } = await import('../models/enums');

      let solicitudes: any[] = [];

      if (userRole === 'propietario') {
        // Propietario ve solicitudes donde el establecimiento solicitó sus caballos
        const misCaballos = await PropietarioCaballo.findAll({
          where: {
            propietario_usuario_id: usuarioId,
            actual: true
          },
          attributes: ['caballo_id']
        });

        const caballoIds = misCaballos.map(pc => pc.caballo_id);

        if (caballoIds.length > 0) {
          solicitudes = await CaballoEstablecimiento.findAll({
            where: {
              caballo_id: caballoIds,
              estado_asociacion: EstadoAsociacionCE.pending
            },
            include: [
              {
                model: Caballo,
                as: 'caballo',
                attributes: ['id', 'nombre', 'raza']
              },
              {
                model: Establecimiento,
                as: 'establecimiento',
                attributes: ['id', 'nombre', 'direccion_calle']
              }
            ]
          });

          // Filtrar solo las que NO inició el propietario (las inició el establecimiento)
          solicitudes = solicitudes.filter(s => {
            const solicitanteId = s.get('solicitante_id') || (s as any).solicitante_id;
            return solicitanteId !== usuarioId;
          });
        }

      } else if (userRole === 'establecimiento') {
        // Establecimiento ve solicitudes donde propietarios solicitaron asociar a sus establecimientos
        const misEstablecimientos = await MembresiaUsuarioEstablecimiento.findAll({
          where: {
            usuario_id: usuarioId,
            rol_en_establecimiento: RolEnEstablecimiento.capataz,
            estado_membresia: EstadoMembresia.active
          },
          attributes: ['establecimiento_id']
        });

        const establecimientoIds = misEstablecimientos.map(m => m.establecimiento_id);

        if (establecimientoIds.length > 0) {
          solicitudes = await CaballoEstablecimiento.findAll({
            where: {
              establecimiento_id: establecimientoIds,
              estado_asociacion: EstadoAsociacionCE.pending
            },
            include: [
              {
                model: Caballo,
                as: 'caballo',
                attributes: ['id', 'nombre', 'raza']
              },
              {
                model: Establecimiento,
                as: 'establecimiento',
                attributes: ['id', 'nombre', 'direccion_calle']
              }
            ]
          });

          // Filtrar solo las que NO inició el establecimiento (las inició el propietario)
          solicitudes = solicitudes.filter(s => {
            const solicitanteId = s.get('solicitante_id') || (s as any).solicitante_id;
            return solicitanteId !== usuarioId;
          });

          // Agregar info del propietario
          for (const solicitud of solicitudes) {
            const caballoId = solicitud.get('caballo_id') || (solicitud as any).caballo_id;
            const propietario = await PropietarioCaballo.findOne({
              where: {
                caballo_id: caballoId,
                actual: true
              },
              include: [{
                model: User,
                as: 'propietario',
                attributes: ['id', 'nombre', 'apellido', 'email']
              }]
            });

            if (propietario && propietario.propietario) {
              (solicitud as any).propietario = propietario.propietario;
            }
          }
        }
      }

      res.json(ApiResponse.success(solicitudes));

    } catch (error: any) {
      logger.error('Error obteniendo solicitudes pendientes', { 
        error,
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json(ApiResponse.error('Error interno del servidor'));
    }
  }
}
