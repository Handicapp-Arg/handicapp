import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
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

export async function sendEmail({ to, subject, html }: EmailParams) {
  const tx = getTransporter();
  const from = `${config.email.from.name} <${config.email.from.email || 'no-reply@handicapp.local'}>`;
  if (!tx) {
    // No-op en desarrollo si SMTP no está configurado
    logger.info(`Email simulado a ${to} | ${subject}`);
    logger.debug(html);
    return { simulated: true } as const;
  }
  const info = await tx.sendMail({ from, to, subject, html });
  logger.info(`Email enviado a ${to} - id: ${info.messageId}`);
  return { messageId: info.messageId };
}

export function renderBrandedEmail({ title, intro, actionText, actionUrl, footer }: { title: string; intro: string; actionText: string; actionUrl: string; footer?: string; }) {
  return `
  <div style="font-family: Arial, sans-serif; background: #f6f5f3; padding: 24px; color: #2a1609;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:12px;overflow:hidden">
      <div style="background: linear-gradient(135deg,#3C2013,#2A1609); padding: 24px; text-align:center;">
        <img src="${config.app.webUrl}/logos/logo-icon-brown.png" alt="HandicApp" style="width:64px;height:64px;background:#fff;border-radius:16px;padding:8px" />
        <h1 style="color:#F5DEB3;margin:12px 0 0;font-size:20px;">${title}</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size:14px;line-height:1.6;color:#3C2013">${intro}</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${actionUrl}" style="display:inline-block;background:#D2B48C;color:#3C2013;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600">${actionText}</a>
        </div>
        <p style="font-size:12px;color:#6b4f3a">Si no solicitaste esta acción, puedes ignorar este mensaje.</p>
      </div>
      <div style="padding: 16px; text-align:center; font-size:12px; color:#6b4f3a; border-top:1px solid #eee; background:#faf9f7;">
        ${footer || '© HandicApp'}
      </div>
    </div>
  </div>`;
}
