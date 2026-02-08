import { NextResponse } from "next/server"

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/publicaciones/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const { getPublicacionById } = await import("@/lib/actions/publicaciones")
    const publicacion = await getPublicacionById(id)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error fetching publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PATCH /api/publicaciones/[id] - Actualizar publicacion
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params

  try {
    const { actualizarPublicacionDB } = await import("@/lib/actions/publicaciones")
    const body = await request.json()
    const publicacion = await actualizarPublicacionDB(id, body)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error updating publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
