/**
 * Email Sender Utility
 * Lógica centralizada para envío de emails usando Resend API o SMTP
 */

import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/config';
import { logger } from './logger';

type EmailParams = {
  to: string;
  subject: string;
  html: string;
  fromEmail?: string;
  fromName?: string;
};

type EmailResult = {
  messageId: string;
  provider: 'resend' | 'smtp' | 'simulated';
};

let transporter: nodemailer.Transporter | null = null;

/**
 * Obtener transporter SMTP (lazy initialization)
 */
function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  
  if (!config.email.smtp.host || !config.email.smtp.port || !config.email.smtp.user || !config.email.smtp.pass) {
    logger.warn('SMTP no configurado; EmailService funcionará en modo no-op');
    return null;
  }
  
  transporter = nodemailer.createTransport({
    host: config.email.smtp.host,
    port: config.email.smtp.port,
    secure: config.email.smtp.port === 465,
    auth: {
      user: config.email.smtp.user,
      pass: config.email.smtp.pass,
    },
  });
  
  return transporter;
}

/**
 * Enviar email usando Resend API
 */
async function sendViaResend(params: EmailParams): Promise<EmailResult> {
  const apiKey = config.email.resend.apiKey;
  if (!apiKey) {
    throw new Error('Resend API key no configurada');
  }

  const resend = new Resend(apiKey);
  const fromEmail = params.fromEmail || config.email.resend.fromEmail || config.email.from.email || 'notifications@handicapp.app';
  const fromName = params.fromName || config.email.resend.fromName || config.email.from.name || 'App';
  const resendFrom = `${fromName} <${fromEmail}>`;

  logger.info(`📧 Enviando email via Resend - From: ${resendFrom}, To: ${params.to}, Subject: ${params.subject}`);

  const result = await resend.emails.send({
    from: resendFrom,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  if (result.error) {
    logger.error('❌ Error de Resend:', result.error);
    throw new Error(`Resend error: ${result.error.message || JSON.stringify(result.error)}`);
  }

  logger.info(`✅ Email enviado via Resend a ${params.to} - ID: ${result.data?.id || 'N/A'}`);
  return {
    messageId: result.data?.id || 'resend-sent',
    provider: 'resend',
  };
}

/**
 * Enviar email usando SMTP tradicional
 */
async function sendViaSMTP(params: EmailParams): Promise<EmailResult> {
  const tx = getTransporter();
  if (!tx) {
    logger.info(`Email simulado a ${params.to} | ${params.subject}`);
    logger.debug(params.html);
    return {
      messageId: 'simulated',
      provider: 'simulated',
    };
  }

  const defaultFromEmail = params.fromEmail || config.email.from.email || 'no-reply@handicapp.local';
  const defaultFromName = params.fromName || config.email.from.name || 'App';
  const from = `${defaultFromName} <${defaultFromEmail}>`;

  const info = await tx.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  logger.info(`Email enviado via SMTP a ${params.to} - id: ${info.messageId}`);
  return {
    messageId: info.messageId || 'smtp-sent',
    provider: 'smtp',
  };
}

/**
 * Enviar email (usa Resend si está disponible, sino SMTP)
 */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  try {
    // Priorizar Resend API si está configurada (evita bloqueos SMTP en Render)
    if (config.email.resend.apiKey) {
      try {
        return await sendViaResend(params);
      } catch (error: any) {
        logger.error('❌ Error enviando email via Resend:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        // Fallback a SMTP si Resend falla
        logger.warn('Intentando fallback a SMTP...');
        return await sendViaSMTP(params);
      }
    }

    // Fallback a SMTP tradicional
    return await sendViaSMTP(params);
  } catch (error: any) {
    logger.error('❌ Error crítico enviando email:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
}

