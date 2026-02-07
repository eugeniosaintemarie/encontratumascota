import { NextResponse } from "next/server"

// Verificar si DATABASE_URL esta configurada
function hasDB() {
  return !!process.env.DATABASE_URL
}

// GET /api/publicaciones - Listar publicaciones
export async function GET(request: Request) {
  if (!hasDB()) {
    return NextResponse.json({ publicaciones: null, mode: "mock" })
  }

  try {
    const { getPublicaciones } = await import("@/lib/actions/publicaciones")
    
    const { searchParams } = new URL(request.url)
    const especie = searchParams.get("especie") || undefined
    const sexo = searchParams.get("sexo") || undefined
    const ubicacion = searchParams.get("ubicacion") || undefined
    const transitoUrgente = searchParams.get("transitoUrgente") === "true"
    const soloEnTransito = searchParams.get("soloEnTransito") === "true"

    const publicaciones = await getPublicaciones({
      especie: especie as any,
      sexo: sexo as any,
      ubicacion,
      transitoUrgente: transitoUrgente || undefined,
      soloEnTransito: soloEnTransito || undefined,
    })

    return NextResponse.json({ publicaciones, mode: "db" })
  } catch (error) {
    console.error("Error fetching publicaciones:", error)
    return NextResponse.json({ publicaciones: null, mode: "error" }, { status: 500 })
  }
}

// POST /api/publicaciones - Crear publicacion
export async function POST(request: Request) {
  if (!hasDB()) {
    return NextResponse.json({ error: "Base de datos no configurada" }, { status: 503 })
  }

  try {
    const { crearPublicacion } = await import("@/lib/actions/publicaciones")
    const body = await request.json()

    const publicacion = await crearPublicacion({
      especie: body.especie,
      raza: body.raza,
      sexo: body.sexo,
      color: body.color,
      descripcion: body.descripcion,
      imagenUrl: body.imagenUrl || "",
      ubicacion: body.ubicacion,
      fechaEncuentro: new Date(body.fechaEncuentro),
      contactoNombre: body.contactoNombre,
      contactoTelefono: body.contactoTelefono,
      contactoEmail: body.contactoEmail,
      usuarioId: body.usuarioId,
      transitoUrgente: body.transitoUrgente || false,
    })

    return NextResponse.json({ publicacion }, { status: 201 })
  } catch (error) {
    console.error("Error creating publicacion:", error)
    return NextResponse.json({ error: "Error al crear publicacion" }, { status: 500 })
  }
}
