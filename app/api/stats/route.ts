import { NextResponse } from "next/server"

function hasDB() {
  return !!process.env.DATABASE_URL
}

// GET /api/stats - Obtener estadísticas del sitio
export async function GET() {
  if (!hasDB()) {
    return NextResponse.json({ mascotasReunidas: 0, mode: "mock" })
  }

  try {
    const { contarMascotasReunidas } = await import("@/lib/actions/publicaciones")
    const mascotasReunidas = await contarMascotasReunidas()
    return NextResponse.json({ mascotasReunidas, mode: "db" })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ mascotasReunidas: 0, mode: "error" }, { status: 500 })
  }
}
