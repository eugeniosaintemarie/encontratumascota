import { NextResponse } from "next/server"

// POST /api/auth/register
export async function POST(request: Request) {
  try {
    const { registrarUsuario } = await import("@/lib/actions/auth")
    const { nombre, email, password } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const result = await registrarUsuario({ nombre, email, password })

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    return NextResponse.json({ user: result.user }, { status: 201 })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
