import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"
import { isDemoRequest } from "@/lib/env"

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
    const soloActivasParam = searchParams.get("soloActivas")
    const soloActivas = soloActivasParam === null ? undefined : soloActivasParam === "true"

    const publicaciones = await getPublicaciones({
      especie: especie as any,
      sexo: sexo as any,
      ubicacion,
      transitoUrgente: transitoUrgente || undefined,
      soloEnTransito: soloEnTransito || undefined,
      soloActivas: soloActivas,
    }, { forceDemo: isDemoRequest(request) })

    return NextResponse.json({ publicaciones })
  } catch (error) {
    console.error("Error fetching publicaciones:", error)
    return NextResponse.json({ publicaciones: null }, { status: 500 })
  }
}

// POST /api/publicaciones - Crear publicacion (requiere autenticacion)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { crearPublicacion } = await import("@/lib/actions/publicaciones")
    const body = await request.json()

    // Usar el usuarioId de la sesion, NO del body (previene suplantacion)
    const publicacion = await crearPublicacion({
      tipoPublicacion: body.tipoPublicacion as "perdida" | "adopcion" | "buscada",
      especie: body.especie,
      raza: body.raza,
      sexo: body.sexo,
      color: body.color,
      descripcion: body.descripcion,
      edad: body.edad,
      imagenUrl: body.imagenUrl || "",
      ubicacion: body.ubicacion,
      fechaEncuentro: body.fechaEncuentro ? new Date(body.fechaEncuentro) : undefined,
      contactoNombre: body.contactoNombre,
      contactoTelefono: body.contactoTelefono,
      contactoEmail: body.contactoEmail,
      mostrarContactoPublico: !!body.mostrarContactoPublico,
      usuarioId: session.user.id,
      transitoUrgente: !!body.transitoUrgente,
      esPrueba: !!body.esPrueba,
    }, { forceDemo: isDemoRequest(request) })

    return NextResponse.json({ publicacion }, { status: 201 })
  } catch (error) {
    console.error("Error creating publicacion:", error)
    return NextResponse.json({ error: "Error al crear publicacion" }, { status: 500 })
  }
}
