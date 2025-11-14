/**
 * Email de Verificación de Cuenta
 */

import { config } from '../config/config';
import { renderBrandedEmail } from './templates/baseTemplate';
import { sendEmail } from '../utils/emailSender';
import { logger } from '../utils/logger';

export interface VerificationEmailParams {
  nombre: string;
  email: string;
  verifyToken: string;
}

/**
 * Enviar email de verificación de cuenta
 */
export async function sendVerificationEmail({
  nombre,
  email,
  verifyToken,
}: VerificationEmailParams): Promise<void> {
  try {
    const verifyUrl = `${config.app.webUrl}/verify?token=${encodeURIComponent(verifyToken)}`;
    
    const html = renderBrandedEmail({
      title: 'Verificá tu cuenta',
      intro: `Hola ${nombre}, gracias por registrarte en HandicApp. Por favor verificá tu correo para activar tu cuenta.`,
      actionText: 'Verificá mi cuenta',
      actionUrl: verifyUrl,
      footer: 'Equipo HandicApp',
    });

    logger.info(`Intentando enviar email de verificación a: ${email}`);
    await sendEmail({
      to: email,
      subject: 'Verifica tu cuenta - HandicApp',
      html,
    });
    logger.info(`Email de verificación enviado exitosamente a: ${email}`);
  } catch (err: any) {
    logger.error('Fallo enviando email de verificación', {
      email,
      error: err?.message || String(err),
      stack: err?.stack,
    });
    throw err;
  }
}

