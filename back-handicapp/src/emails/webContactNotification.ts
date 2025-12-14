/**
 * Plantilla de email para notificación de nuevo contacto desde la web
 */

type WebContactData = {
  name: string;
  email: string;
  message: string;
  date: string;
};

export function webContactNotificationEmail(data: WebContactData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo mensaje de contacto</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                Nuevo Mensaje de Contacto
              </h1>
              <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">
                HandicApp Web
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Has recibido un nuevo mensaje a través del formulario de contacto de la página web:
              </p>
              
              <!-- Contact Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0f172a; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #0f172a; font-size: 14px;">Nombre:</strong>
                          <p style="color: #475569; margin: 5px 0 0 0; font-size: 15px;">${data.name}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #0f172a; font-size: 14px;">Email:</strong>
                          <p style="color: #475569; margin: 5px 0 0 0; font-size: 15px;">
                            <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <strong style="color: #0f172a; font-size: 14px;">Fecha:</strong>
                          <p style="color: #475569; margin: 5px 0 0 0; font-size: 15px;">${data.date}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Message Box -->
              <div style="margin: 20px 0;">
                <strong style="color: #0f172a; font-size: 14px; display: block; margin-bottom: 10px;">Mensaje:</strong>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px;">
                  <p style="color: #475569; margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>
              
              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 20px 0;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: Tu consulta en HandicApp" 
                       style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      Responder al Cliente
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0; text-align: center; line-height: 1.5;">
                Este mensaje fue enviado automáticamente desde el formulario de contacto de<br>
                <strong style="color: #0f172a;">HandicApp</strong> - Sistema de Gestión Ecuestre
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
