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
  // Paleta moderna alineada con el diseño de la app
  const bg = '#f8fafc';           // slate-50 - fondo general
  const card = '#ffffff';          // blanco puro
  const border = '#e2e8f0';        // slate-200
  const text = '#1e293b';          // slate-800 - texto principal
  const muted = '#64748b';         // slate-500 - texto secundario
  const headerBg = '#0f172a';      // slate-900 - header oscuro
  const headerText = '#ffffff';    // blanco
  const accent = '#af936f';        // color dorado/bronceado de la marca
  const btnBg = '#1e293b';         // slate-800 - botón principal
  const btnText = '#ffffff';       // blanco
  const btnHover = '#0f172a';      // slate-900

  const logo = loadEmbeddedLogo();
  const logoTag = logo
    ? `<img src="${logo}" alt="HandicApp" width="64" height="64" style="display:block;margin:0 auto;width:64px;height:64px;object-fit:contain;" />`
    : `<div style="width:64px;height:64px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,0.1);color:${accent};font-weight:800;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:24px;">H</div>`;

  // Template moderno con diseño limpio
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="background:${bg};padding:40px 16px;min-height:100vh;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background:${card};border:1px solid ${border};border-radius:16px;overflow:hidden;box-shadow:0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06);">
        
        <!-- Header con Logo -->
        <tr>
          <td style="background:${headerBg};padding:32px 24px;text-align:center;position:relative;">
            <!-- Pattern Background Sutil -->
            <div style="position:absolute;top:0;left:0;right:0;bottom:0;opacity:0.05;background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=');pointer-events:none;"></div>
            
            <div style="position:relative;z-index:1;">
              ${logoTag}
              <h1 style="margin:16px 0 0;font-size:24px;line-height:1.3;color:${headerText};font-weight:700;">${title}</h1>
            </div>
          </td>
        </tr>
        
        <!-- Contenido Principal -->
        <tr>
          <td style="padding:32px 24px;">
            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:${text};">${intro}</p>
            
            <!-- Botón de Acción -->
            <div style="text-align:center;margin:32px 0;">
              <a href="${actionUrl}" style="display:inline-block;background:${btnBg};color:${btnText};text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;letter-spacing:0.3px;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);transition:all 0.2s;">${actionText}</a>
            </div>
            
            <!-- Texto Adicional -->
            <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:${muted};">
              Si no solicitaste esta acción, podés ignorar este mensaje.
            </p>
            
            <!-- Link Alternativo -->
            <div style="margin-top:24px;padding:16px;background:${bg};border:1px solid ${border};border-radius:8px;">
              <p style="margin:0 0 8px;font-size:12px;color:${muted};font-weight:500;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:</p>
              <p style="margin:0;font-size:12px;color:${accent};word-break:break-all;"><a href="${actionUrl}" style="color:${accent};text-decoration:none;">${actionUrl}</a></p>
            </div>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="padding:20px 24px;text-align:center;border-top:1px solid ${border};background:${bg};">
            <p style="margin:0 0 8px;color:${muted};font-size:13px;line-height:1.5;">
              ${footer || 'Equipo HandicApp - Gestión Hípica Profesional'}
            </p>
            <p style="margin:0;color:${muted};font-size:12px;opacity:0.7;">
              © ${new Date().getFullYear()} HandicApp. Todos los derechos reservados.
            </p>
          </td>
        </tr>
      </table>
      
      <!-- Espaciado inferior -->
      <div style="text-align:center;margin-top:24px;">
        <p style="margin:0;color:${muted};font-size:12px;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    </div>
  </body>
  </html>`;
}
