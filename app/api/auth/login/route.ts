import { NextResponse } from "next/server"

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const { loginUsuario } = await import("@/lib/actions/auth")
    const { email, password } = await request.json()
    const result = await loginUsuario(email, password)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
