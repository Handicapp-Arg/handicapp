import { CodigoQR } from '../models/CodigoQR';
import { Caballo } from '../models/Caballo';
import { EstadoQR } from '../models/enums';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// TODO: Instalar qrcode cuando npm install funcione
// import QRCode from 'qrcode';

interface GenerateQRResult {
  qrCode: CodigoQR;
  qrDataUrl?: string; // Base64 data URL del QR code generado
}

export class QRCodeService {
  /**
   * Generar o recuperar QR code para un caballo
   */
  static async generateQRForCaballo(
    caballoId: number,
    userId: number,
    forceNew: boolean = false
  ): Promise<GenerateQRResult> {
    logger.info('Generando QR code para caballo', { caballoId, userId, forceNew });

    // Verificar que el caballo existe
    const caballo = await Caballo.findByPk(caballoId);
    if (!caballo) {
      throw new NotFoundError('Caballo no encontrado');
    }

    // Buscar QR code activo existente
    if (!forceNew) {
      const existingQR = await CodigoQR.findOne({
        where: {
          caballo_id: caballoId,
          estado: EstadoQR.active,
        },
        order: [['creado_el', 'DESC']],
      });

      if (existingQR) {
        // Verificar si el QR no ha expirado
        if (!existingQR.expira_el || new Date(existingQR.expira_el) > new Date()) {
          logger.info('QR code activo encontrado', { qrId: existingQR.id });
          
          // TODO: Generar imagen del QR code cuando tengamos la dependencia
          // const qrDataUrl = await this.generateQRImage(existingQR.token);
          
          return {
            qrCode: existingQR,
            // qrDataUrl
          };
        } else {
          // Marcar como expirado
          existingQR.estado = EstadoQR.expired;
          await existingQR.save();
        }
      }
    }

    // Revocar todos los QR codes activos anteriores si se fuerza nuevo
    if (forceNew) {
      await CodigoQR.update(
        { estado: EstadoQR.revoked },
        {
          where: {
            caballo_id: caballoId,
            estado: EstadoQR.active,
          },
        }
      );
    }

    // Generar nuevo token único
    const token = this.generateUniqueToken(caballoId);

    // Crear nuevo QR code
    const newQR = await CodigoQR.create({
      caballo_id: caballoId,
      token,
      estado: EstadoQR.active,
      creado_por_usuario_id: userId,
      expira_el: null, // Sin expiración por defecto
    });

    logger.info('QR code creado exitosamente', { qrId: newQR.id, token });

    // TODO: Generar imagen del QR code
    // const qrDataUrl = await this.generateQRImage(token);

    return {
      qrCode: newQR,
      // qrDataUrl
    };
  }

  /**
   * Validar un QR code por su token
   */
  static async validateQR(token: string): Promise<{
    valid: boolean;
    qrCode?: CodigoQR;
    caballo?: Caballo | undefined;
    message?: string;
  }> {
    logger.info('Validando QR code', { token });

    const qrCode = await CodigoQR.findOne({
      where: { token },
      include: [
        {
          model: Caballo,
          as: 'caballo',
        },
      ],
    });

    if (!qrCode) {
      return {
        valid: false,
        message: 'QR code no encontrado',
      };
    }

    // Cargar caballo si no está incluido
    let caballo = (qrCode as any).caballo as Caballo | undefined;
    if (!caballo) {
      caballo = (await Caballo.findByPk(qrCode.caballo_id)) || undefined;
    }

    // Verificar estado
    if (qrCode.estado === EstadoQR.revoked) {
      return {
        valid: false,
        qrCode,
        message: 'QR code revocado',
      };
    }

    if (qrCode.estado === EstadoQR.expired) {
      return {
        valid: false,
        qrCode,
        message: 'QR code expirado',
      };
    }

    // Verificar expiración
    if (qrCode.expira_el && new Date(qrCode.expira_el) < new Date()) {
      // Marcar como expirado
      qrCode.estado = EstadoQR.expired;
      await qrCode.save();

      return {
        valid: false,
        qrCode,
        message: 'QR code expirado',
      };
    }

    logger.info('QR code válido', { qrId: qrCode.id, caballoId: qrCode.caballo_id });

    return {
      valid: true,
      qrCode,
      caballo,
      message: 'QR code válido',
    };
  }

  /**
   * Obtener información del caballo asociado a un QR code
   */
  static async getCaballoByQR(token: string): Promise<Caballo> {
    const validation = await this.validateQR(token);

    if (!validation.valid || !validation.caballo) {
      throw new ValidationError(validation.message || 'QR code inválido');
    }

    return validation.caballo;
  }

  /**
   * Revocar un QR code
   */
  static async revokeQR(qrId: number, userId: number): Promise<void> {
    logger.info('Revocando QR code', { qrId, userId });

    const qrCode = await CodigoQR.findByPk(qrId);
    if (!qrCode) {
      throw new NotFoundError('QR code no encontrado');
    }

    if (qrCode.estado === EstadoQR.revoked) {
      throw new ValidationError('QR code ya fue revocado');
    }

    qrCode.estado = EstadoQR.revoked;
    await qrCode.save();

    logger.info('QR code revocado exitosamente', { qrId });
  }

  /**
   * Obtener todos los QR codes de un caballo
   */
  static async getQRCodesByCaballo(caballoId: number): Promise<CodigoQR[]> {
    logger.info('Obteniendo QR codes por caballo', { caballoId });

    const caballo = await Caballo.findByPk(caballoId);
    if (!caballo) {
      throw new NotFoundError('Caballo no encontrado');
    }

    const qrCodes = await CodigoQR.findAll({
      where: { caballo_id: caballoId },
      order: [['creado_el', 'DESC']],
    });

    return qrCodes;
  }

  /**
   * Generar token único para QR code
   */
  private static generateUniqueToken(caballoId: number): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const data = `${caballoId}-${timestamp}-${random}`;
    
    // Generar hash SHA256
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    
    // Usar los primeros 64 caracteres (el hash completo)
    return hash.substring(0, 64);
  }

  /**
   * Generar imagen QR code en formato base64
   * TODO: Implementar cuando la dependencia qrcode esté instalada
   */
  // @ts-ignore - Método reservado para futura implementación
  private static async generateQRImage(token: string): Promise<string> {
    try {
      // Construir URL completa para escanear
      // En producción, esto debería ser la URL pública de la app
      const qrUrl = `${process.env['FRONTEND_URL'] || 'https://handicapp.com'}/scan/${token}`;

      // TODO: Descomentar cuando qrcode esté instalado
      // return await QRCode.toDataURL(qrUrl, {
      //   errorCorrectionLevel: 'H',
      //   type: 'image/png',
      //   width: 512,
      //   margin: 2,
      // });

      // Por ahora retornamos la URL como string
      logger.warn('QR code image generation not implemented yet', { token });
      return qrUrl;
    } catch (error: any) {
      logger.error('Error generando imagen QR', { error: error?.message });
      throw error;
    }
  }

  /**
   * Generar imagen QR code como buffer (para descarga)
   */
  static async generateQRBuffer(token: string): Promise<Buffer> {
    const qrUrl = `${process.env['FRONTEND_URL'] || 'https://handicapp.com'}/scan/${token}`;

    // TODO: Descomentar cuando qrcode esté instalado
    // return await QRCode.toBuffer(qrUrl, {
    //   errorCorrectionLevel: 'H',
    //   type: 'png',
    //   width: 512,
    //   margin: 2,
    // });

    // Por ahora retornamos buffer vacío
    logger.warn('QR code buffer generation not implemented yet', { token });
    return Buffer.from(qrUrl);
  }
}
