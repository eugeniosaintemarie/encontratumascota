import { NextResponse } from "next/server"

type RouteParams = { params: Promise<{ id: string }> }

function hasDB() {
  return !!process.env.DATABASE_URL
}

// POST /api/publicaciones/[id]/cerrar
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params
  
  if (!hasDB()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }

  try {
    const { cerrarPublicacionDB } = await import("@/lib/actions/publicaciones")
    const { motivo } = await request.json()

    const publicacion = await cerrarPublicacionDB(id, motivo)

    if (!publicacion) {
      return NextResponse.json({ error: "Publicacion no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ publicacion })
  } catch (error) {
    console.error("Error cerrando publicacion:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
