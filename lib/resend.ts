import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("[Resend] API key no configurada, email no enviado");
    return { success: false, error: "API key no configurada" };
  }

  try {
    const result = await resend.emails.send({
      from: "Encontrá Tu Mascota <noresponder@encontratumascota.ar>",
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error("[Resend] Error enviando email:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Resend] Error:", error);
    return { success: false, error: String(error) };
  }
}

export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: "Test - Encontrá Tu Mascota",
    html: "<p>¡Configuración de Resend funcionando correctamente! 🎉</p>",
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string,
) {
  const verifyUrl = `${baseUrl}/verificar?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear135deg, #4F46E5 0%, #7C3AED 100%; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Encontrá Tu Mascota</h1>
      </div>
      
      <h2 style="color: #1f2937; margin-bottom: 16px;">¡Bienvenido! 👋</h2>
      
      <p style="color: #4b5563; margin-bottom: 24px;">
        Gracias por registrarte en <strong>Encontrá Tu Mascota</strong>. 
        Para completar tu registro, necesitamos verificar tu correo electrónico.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Verificar mi correo electrónico
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
        Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
        <span style="color: #4F46E5; word-break: break-all;">${verifyUrl}</span>
      </p>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">
          <strong>Nota:</strong> Este enlace vence en 24 horas. Si no completaste este registro, puedes ignorar este correo.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
        © ${new Date().getFullYear()} Encontrá Tu Mascota. Todos los derechos reservados.
      </p>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "🐾 Verifica tu correo electrónico - Encontrá Tu Mascota",
    html,
  });
}
