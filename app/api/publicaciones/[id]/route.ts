import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/publicaciones/[id] (publico)
export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const { getPublicacionById } = await import("@/lib/actions/publicaciones")
    const { isDemoRequest } = await import("@/lib/env")
    const publicacion = await getPublicacionById(id, { forceDemo: isDemoRequest(request) })

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error fetching publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PATCH /api/publicaciones/[id] - Actualizar publicacion (requiere ser el dueno)
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la publicacion pertenece al usuario
    const { getPublicacionById, actualizarPublicacionDB } = await import("@/lib/actions/publicaciones")
    const { isDemoRequest } = await import("@/lib/env")
    const existing = await getPublicacionById(id, { forceDemo: isDemoRequest(request) })
    if (!existing) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }
    if (existing.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    // Solo permitir campos seguros (no permitir cambiar usuarioId)
    const { usuarioId: _, mascota, ...rest } = body
    
    // Si viene el objeto mascota, extraer sus campos
    const safeData = mascota
      ? { ...mascota, ...rest }
      : rest
    
    const publicacion = await actualizarPublicacionDB(id, safeData)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error updating publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE /api/publicaciones/[id] - Eliminar publicacion (requiere ser el dueno)
export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar que la publicacion pertenece al usuario
    const { getPublicacionById, eliminarPublicacionDB } = await import("@/lib/actions/publicaciones")
    const { isDemoRequest } = await import("@/lib/env")
    const existing = await getPublicacionById(id, { forceDemo: isDemoRequest(request) })
    if (!existing) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }
    if (existing.usuarioId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const publicacion = await eliminarPublicacionDB(id)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Publicacion eliminada" })
  } catch (error) {
    console.error("Error deleting publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
