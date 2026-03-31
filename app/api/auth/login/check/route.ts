import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { usuarios } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 })
    }

    const usuario = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    })

    if (!usuario) {
      return NextResponse.json({ verificado: false, error: "Usuario no encontrado" })
    }

    return NextResponse.json({ verificado: usuario.emailVerificado })
  } catch (error) {
    console.error("[API /auth/login/check] Error:", error)
    return NextResponse.json({ verificado: false, error: "Error interno" }, { status: 500 })
  }
}