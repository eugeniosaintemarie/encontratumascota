import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailVerificacionTokens } from "@/lib/db/schema"
import { sendVerificationEmail } from "@/lib/resend"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const { email, nombre, baseUrl } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    console.log("[API /auth/verify/send] RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY)
    console.log("[API /auth/verify/send] DATABASE_URL configured:", !!process.env.DATABASE_URL)

    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    console.log("[API /auth/verify/send] Inserting token for email:", email)

    await db.insert(emailVerificacionTokens).values({
      email,
      token,
      expiresAt,
    })

    console.log("[API /auth/verify/send] Token inserted, sending email...")

    const result = await sendVerificationEmail(email, token, baseUrl || "https://encontratumascota.ar")

    if (!result.success) {
      console.error("[API /auth/verify/send] Resend failed:", result.error)
      return NextResponse.json({ error: "Error al enviar email de verificación" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API /auth/verify/send] Error:", error)
    return NextResponse.json({ error: "Error interno", details: String(error) }, { status: 500 })
  }
}