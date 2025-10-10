import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

let transporter: nodemailer.Transporter | null = null;
let embeddedLogoDataUri: string | null = null;

function loadEmbeddedLogo() {
  if (embeddedLogoDataUri !== null) return embeddedLogoDataUri;
  // Permite override por variable de entorno (futura) EMAIL_LOGO_PATH
  const customPath = process.env['EMAIL_LOGO_PATH'];
  const candidatePaths = [
    customPath,
    // Priorizar logo blanco para headers oscuros
    path.resolve(process.cwd(), '..', 'front-handicapp', 'public', 'logos', 'logo-icon-white.png'),
    path.resolve(process.cwd(), '..', 'front-handicapp', 'public', 'logos', 'logo-full-white.png'),
    // Ruta relativa intentando llegar al front (monorepo) en desarrollo
    path.resolve(process.cwd(), '..', 'front-handicapp', 'public', 'logos', 'logo-icon-brown.png'),
    path.resolve(process.cwd(), 'public', 'logo-icon-brown.png'),
  ].filter(Boolean) as string[];
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const data = fs.readFileSync(p);
        const b64 = data.toString('base64');
        embeddedLogoDataUri = `data:image/png;base64,${b64}`;
        break;
      }
    } catch (e) {
      // Continuar con siguiente
    }
  }
  if (!embeddedLogoDataUri) embeddedLogoDataUri = ''; // Evita reintentos
  return embeddedLogoDataUri;
}

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
  // Paleta accesible con mayor contraste
  const bg = '#f3f0ea';
  const card = '#ffffff';
  const border = '#e4d7c8';
  const text = '#2b1a10';
  const muted = '#6a4d3a';
  const headerBg = '#2B1A10';
  const headerAccent = '#C8A97E';
  const btnBg = '#5C3B2A';
  const btnText = '#FFFFFF';

  const logo = loadEmbeddedLogo();
  const logoTag = logo
    ? `<img src="${logo}" alt="HandicApp logo" width="80" height="80" style="display:block;margin:0 auto;width:80px;height:80px;object-fit:contain;" />`
    : `<div style="width:80px;height:80px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;background:#fff;color:${headerBg};font-weight:800;font-family:Arial,Helvetica,sans-serif;">H</div>`;

  // Layout híbrido (tablas para compatibilidad + estilos inline)
  return `
  <div style="background:${bg};padding:24px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:${card};border:1px solid ${border};border-radius:16px;overflow:hidden;">
      <tr>
        <td style="background:${headerBg};padding:28px 24px;text-align:center;">
          ${logoTag}
          <h1 style="margin:14px 0 0;font-size:22px;line-height:1.3;color:${headerAccent};font-family:Arial,Helvetica,sans-serif;">${title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 24px 8px 24px;color:${text};font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${text};">${intro}</p>
          <div style="text-align:center;margin:24px 0 18px;">
            <a href="${actionUrl}" style="display:inline-block;background:${btnBg};color:${btnText};text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:700;font-size:15px;letter-spacing:.2px;border:1px solid #0001;">${actionText}</a>
          </div>
          <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:${muted};">Si no solicitaste esta acción, podés ignorar este mensaje.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:14px 10px 18px;text-align:center;border-top:1px solid ${border};background:#f9f7f5;color:${muted};font-size:12px;font-family:Arial,Helvetica,sans-serif;">
          ${footer || 'Equipo HandicApp'}
        </td>
      </tr>
    </table>
  </div>`;
}
