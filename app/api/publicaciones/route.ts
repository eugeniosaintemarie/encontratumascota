import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"

// GET /api/publicaciones - Listar publicaciones (publico)
export async function GET(request: Request) {
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

    return NextResponse.json({ publicaciones })
  } catch (error) {
    console.error("Error fetching publicaciones:", error)
    return NextResponse.json({ publicaciones: null }, { status: 500 })
  }
}

// POST /api/publicaciones - Crear publicacion (requiere autenticacion)
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { crearPublicacion } = await import("@/lib/actions/publicaciones")
    const body = await request.json()

    // Usar el usuarioId de la sesion, NO del body (previene suplantacion)
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
      usuarioId: session.user.id,
      transitoUrgente: body.transitoUrgente || false,
    })

    return NextResponse.json({ publicacion }, { status: 201 })
  } catch (error) {
    console.error("Error creating publicacion:", error)
    return NextResponse.json({ error: "Error al crear publicacion" }, { status: 500 })
  }
}
