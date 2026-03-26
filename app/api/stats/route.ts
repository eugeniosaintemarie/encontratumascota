import { NextResponse } from "next/server"

// GET /api/stats - Obtener estadísticas del sitio
export async function GET() {
  try {
    const { contarMascotasReunidas } = await import("@/lib/actions/publicaciones")
    const mascotasReunidas = await contarMascotasReunidas()
    return NextResponse.json({ mascotasReunidas })
  } catch (error) {
    console.error("Error fetching stats:", error)
    // En desarrollo o sin BD, devolver 0 sin error
    return NextResponse.json({ mascotasReunidas: 0 }, { status: 200 })
  }
}
