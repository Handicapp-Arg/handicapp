import { Router, type Router as ExpressRouter } from 'express';
import { QRCodeController } from '../controllers/qrCodeController';
import { requireAuth } from '../middleware/auth';

const router: ExpressRouter = Router();

/**
 * @route   POST /api/v1/qr/validate
 * @desc    Validar un QR code
 * @access  Public (para escanear QR sin autenticación)
 */
router.post('/validate', QRCodeController.validate);

/**
 * @route   GET /api/v1/qr/:token
 * @desc    Obtener información del caballo por QR code
 * @access  Public (para escanear QR sin autenticación)
 */
router.get('/:token', QRCodeController.getInfo);

/**
 * @route   GET /api/v1/qr/:token/download
 * @desc    Descargar imagen del QR code
 * @access  Public
 */
router.get('/:token/download', QRCodeController.download);

/**
 * @route   DELETE /api/v1/qr/:id
 * @desc    Revocar un QR code
 * @access  Private (requiere autenticación)
 */
router.delete('/:id', requireAuth, QRCodeController.revoke);

export default router;
