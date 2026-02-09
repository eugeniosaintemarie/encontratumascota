import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"

type RouteParams = { params: Promise<{ id: string }> }

// POST /api/publicaciones/[id]/cerrar (requiere ser el dueno)
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { getPublicacionById, cerrarPublicacionDB } = await import("@/lib/actions/publicaciones")

    // Verificar que la publicacion pertenece al usuario
    const existing = await getPublicacionById(id)
    if (!existing) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }
    if (existing.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { motivo, transitoContacto } = await request.json()
    const publicacion = await cerrarPublicacionDB(id, motivo, transitoContacto)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error cerrando publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
