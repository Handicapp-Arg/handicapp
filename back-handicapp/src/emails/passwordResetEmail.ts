/**
 * Email de Restablecimiento de Contraseña
 */

import { config } from '../config/config';
import { renderBrandedEmail } from './templates/baseTemplate';
import { sendEmail } from '../utils/emailSender';
import { logger } from '../utils/logger';

export interface PasswordResetEmailParams {
  nombre: string;
  email: string;
  resetToken: string;
}

/**
 * Enviar email de restablecimiento de contraseña
 */
export async function sendPasswordResetEmail({
  nombre,
  email,
  resetToken,
}: PasswordResetEmailParams): Promise<void> {
  try {
    const resetUrl = `${config.app.webUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    
    const html = renderBrandedEmail({
      title: 'Restablecer contraseña',
      intro: `Hola ${nombre}, recibimos una solicitud para restablecer tu contraseña.`,
      actionText: 'Restablecer contraseña',
      actionUrl: resetUrl,
      footer: 'Si no fuiste vos, ignora este correo.',
    });

    await sendEmail({
      to: email,
      subject: 'Restablecer contraseña - HandicApp',
      html,
    });
  } catch (err: any) {
    logger.warn('Fallo enviando email de reset password', {
      email,
      error: err?.message || String(err),
    });
    throw err;
  }
}

