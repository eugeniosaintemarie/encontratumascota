import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    console.warn("[Resend] API key no configurada, email no enviado")
    return { success: false, error: "API key no configurada" }
  }

  try {
    const result = await resend.emails.send({
      from: "Encontrá Tu Mascota <onboarding@resend.dev>",
      to,
      subject,
      html,
    })

    if (result.error) {
      console.error("[Resend] Error enviando email:", result.error)
      return { success: false, error: result.error }
    }

    console.log("[Resend] Email enviado exitosamente:", result.data?.id)
    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("[Resend] Error:", error)
    return { success: false, error: String(error) }
  }
}

export async function sendTestEmail(to: string) {
  return sendEmail({
    to,
    subject: "Test - Encontrá Tu Mascota",
    html: "<p>¡Configuración de Resend funcionando correctamente! 🎉</p>",
  })
}