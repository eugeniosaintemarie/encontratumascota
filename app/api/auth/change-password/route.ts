import { NextResponse } from "next/server"

// POST /api/auth/change-password
export async function POST(request: Request) {
  try {
    const { cambiarPassword } = await import("@/lib/actions/auth")
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const result = await cambiarPassword(userId, currentPassword, newPassword)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cambiando contraseña:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
