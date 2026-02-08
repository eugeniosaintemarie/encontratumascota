import { NextResponse } from "next/server"

// POST /api/auth/register
// Verifica reCAPTCHA v3 antes de permitir el registro.
// El registro real se hace via authClient.signUp.email() en el cliente,
// que pasa por el catch-all handler de Neon Auth.
export async function POST(request: Request) {
  try {
    const { recaptchaToken } = await request.json()

    if (!recaptchaToken) {
      return NextResponse.json({ error: "Token CAPTCHA requerido" }, { status: 400 })
    }

    // Verificar reCAPTCHA con Google
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY no configurada")
      // En desarrollo sin key, permitir el registro
      return NextResponse.json({ verified: true })
    }

    const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secretKey}&response=${recaptchaToken}`,
    })
    const verifyData = await verifyRes.json()

    if (!verifyData.success || (verifyData.score != null && verifyData.score < 0.5)) {
      return NextResponse.json({ error: "Verificacion CAPTCHA fallida. Intenta de nuevo." }, { status: 403 })
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error("Error verificando CAPTCHA:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
