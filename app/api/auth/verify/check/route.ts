import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { emailVerificacionTokens } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 })
    }

    const now = new Date()
    
    const tokenRecord = await db.query.emailVerificacionTokens.findFirst({
      where: and(
        eq(emailVerificacionTokens.token, token),
        eq(emailVerificacionTokens.usado, false),
      ),
    })

    if (!tokenRecord) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    if (tokenRecord.expiresAt < now) {
      return NextResponse.json({ error: "Token expirado" }, { status: 400 })
    }

    await db.update(emailVerificacionTokens)
      .set({ usado: true })
      .where(eq(emailVerificacionTokens.id, tokenRecord.id))

    return NextResponse.json({ 
      success: true, 
      email: tokenRecord.email 
    })
  } catch (error) {
    console.error("[API /auth/verify/check] Error:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}