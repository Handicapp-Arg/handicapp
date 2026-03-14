import type { Request, Response } from 'express';
import { QRCodeService } from '../services/qrCodeService';
import { logger } from '../utils/logger';

export class QRCodeController {
  /**
   * GET /api/v1/caballos/:id/qr
   * Obtener o crear QR code para un caballo
   */
  static async getOrCreate(req: Request, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] || '0');
      const userId = (req as any).user?.id;
      const forceNew = req.query['force'] === 'true';

      if (isNaN(caballoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de caballo inválido',
        });
        return;
      }

      const result = await QRCodeService.generateQRForCaballo(caballoId, userId, forceNew);

      // Convertir instancia Sequelize a objeto plano
      const qrCode = result.qrCode.get({ plain: true }) as any;

      // Construir URL de descarga
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const downloadUrl = `${baseUrl}/api/v1/qr/${qrCode.token}/download`;

      res.status(200).json({
        success: true,
        data: {
          id: qrCode.id,
          token: qrCode.token,
          estado: qrCode.estado,
          expira_el: qrCode.expira_el,
          creado_el: qrCode.creado_el,
          download_url: downloadUrl,
          scan_url: `${process.env['FRONTEND_URL'] || baseUrl}/scan/${qrCode.token}`,
          qr_data_url: result.qrDataUrl,
        },
      });
    } catch (error: any) {
      logger.error('Error obteniendo/creando QR code', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al procesar QR code',
      });
    }
  }

  /**
   * POST /api/v1/qr/validate
   * Validar un QR code
   */
  static async validate(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token de QR code requerido',
        });
        return;
      }

      const validation = await QRCodeService.validateQR(token);

      // Convertir instancias Sequelize a objetos planos
      const qrCodePlain = validation.qrCode?.get({ plain: true }) as any;
      const caballoPlain = validation.caballo?.get({ plain: true }) as any;

      res.status(200).json({
        success: true,
        data: {
          valid: validation.valid,
          message: validation.message,
          qr_code: qrCodePlain
            ? {
                id: qrCodePlain.id,
                estado: qrCodePlain.estado,
                expira_el: qrCodePlain.expira_el,
              }
            : undefined,
          caballo: caballoPlain
            ? {
                id: caballoPlain.id,
                nombre: caballoPlain.nombre,
                microchip: caballoPlain.microchip,
                raza: caballoPlain.raza,
                sexo: caballoPlain.sexo,
                fecha_nacimiento: caballoPlain.fecha_nacimiento,
              }
            : undefined,
        },
      });
    } catch (error: any) {
      logger.error('Error validando QR code', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al validar QR code',
      });
    }
  }

  /**
   * GET /api/v1/qr/:token
   * Obtener información del caballo por token de QR
   */
  static async getInfo(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params['token'] || '';

      const caballo = await QRCodeService.getCaballoByQR(token);

      // Convertir instancia Sequelize a objeto plano
      const caballoPlain = caballo.get({ plain: true }) as any;

      res.status(200).json({
        success: true,
        data: {
          id: caballoPlain.id,
          nombre: caballoPlain.nombre,
          microchip: caballoPlain.microchip,
          raza: caballoPlain.raza,
          sexo: caballoPlain.sexo,
          fecha_nacimiento: caballoPlain.fecha_nacimiento,
          foto_url: caballoPlain.foto_url,
        },
      });
    } catch (error: any) {
      logger.error('Error obteniendo info por QR', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener información',
      });
    }
  }

  /**
   * GET /api/v1/qr/:token/download
   * Descargar imagen del QR code
   */
  static async download(req: Request, res: Response): Promise<void> {
    try {
      const token = req.params['token'] || '';

      // Validar que el QR existe
      const validation = await QRCodeService.validateQR(token);
      if (!validation.valid) {
        res.status(404).json({
          success: false,
          message: validation.message || 'QR code inválido',
        });
        return;
      }

      // Generar imagen del QR
      const qrBuffer = await QRCodeService.generateQRBuffer(token);

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${validation.caballo?.nombre || token}.png"`);

      res.send(qrBuffer);
    } catch (error: any) {
      logger.error('Error descargando QR code', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al descargar QR code',
      });
    }
  }

  /**
   * DELETE /api/v1/qr/:id
   * Revocar un QR code
   */
  static async revoke(req: Request, res: Response): Promise<void> {
    try {
      const qrId = parseInt(req.params['id'] || '0');
      const userId = (req as any).user?.id;

      if (isNaN(qrId)) {
        res.status(400).json({
          success: false,
          message: 'ID de QR code inválido',
        });
        return;
      }

      await QRCodeService.revokeQR(qrId, userId);

      res.status(200).json({
        success: true,
        message: 'QR code revocado correctamente',
      });
    } catch (error: any) {
      logger.error('Error revocando QR code', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al revocar QR code',
      });
    }
  }

  /**
   * GET /api/v1/caballos/:id/qr/todos
   * Obtener todos los QR codes de un caballo
   */
  static async getAllByCaballo(req: Request, res: Response): Promise<void> {
    try {
      const caballoId = parseInt(req.params['id'] || '0');

      if (isNaN(caballoId)) {
        res.status(400).json({
          success: false,
          message: 'ID de caballo inválido',
        });
        return;
      }

      const qrCodes = await QRCodeService.getQRCodesByCaballo(caballoId);

      // Convertir instancias Sequelize a objetos planos
      const qrCodesPlain = qrCodes.map(qr => qr.get({ plain: true }));

      res.status(200).json({
        success: true,
        data: qrCodesPlain,
      });
    } catch (error: any) {
      logger.error('Error obteniendo QR codes', { error: error?.message });
      res.status(error?.statusCode || 500).json({
        success: false,
        message: error?.message || 'Error al obtener QR codes',
      });
    }
  }
}
