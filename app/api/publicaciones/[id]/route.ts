import { NextResponse } from "next/server"

type RouteParams = { params: Promise<{ id: string }> }

function hasDB() {
  return !!process.env.DATABASE_URL
}

// GET /api/publicaciones/[id]
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params
  
  if (!hasDB()) {
    return NextResponse.json({ publicacion: null, mode: "mock" })
  }

  try {
    const { getPublicacionById } = await import("@/lib/actions/publicaciones")
    const publicacion = await getPublicacionById(id)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion, mode: "db" })
  } catch (error) {
    console.error("Error fetching publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PATCH /api/publicaciones/[id] - Actualizar publicacion
export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  
  if (!hasDB()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }

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
