import { NextResponse } from "next/server"

function hasDB() {
  return !!process.env.DATABASE_URL
}

// Usuarios especiales (demo y admin) que saltean validaciones
const SPECIAL_USERS: Record<string, { id: string; nombreUsuario: string; email: string; role: string }> = {
  demo: {
    id: "demo",
    nombreUsuario: "Usuario Demo",
    email: "demo",
    role: "demo",
  },
  admin: {
    id: "admin",
    nombreUsuario: "Administrador",
    email: "admin",
    role: "admin",
  },
}

// POST /api/auth/login
export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Atajo para usuarios especiales (demo/demo, admin/admin)
  const specialUser = SPECIAL_USERS[email?.toLowerCase()]
  if (specialUser && password === email?.toLowerCase()) {
    return NextResponse.json({
      user: {
        id: specialUser.id,
        nombreUsuario: specialUser.nombreUsuario,
        email: specialUser.email,
        role: specialUser.role,
        fechaRegistro: new Date("2026-01-01"),
      },
    })
  }

  if (!hasDB()) {
    // Fallback: validar contra env vars
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
