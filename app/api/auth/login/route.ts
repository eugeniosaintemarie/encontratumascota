import { NextResponse } from "next/server"

function hasDB() {
  return !!process.env.DATABASE_URL
}

// POST /api/auth/login
export async function POST(request: Request) {
  if (!hasDB()) {
    // Fallback: validar contra env vars
    const { email, password } = await request.json()
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ""

    if (email === adminEmail && password === adminPassword) {
      return NextResponse.json({
        user: {
          id: "admin",
          nombreUsuario: process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin",
          email,
          fechaRegistro: new Date("2026-01-01"),
        },
      })
    }
    return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 })
  }

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
