import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"
import { isDemoRequest } from "@/lib/env"
import { sanitizeObject } from "@/lib/sanitize-server"

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
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[API /publicaciones GET] Error fetching publicaciones:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
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

    // Bloquear usuarios demo (modo solo lectura)
    if ((session.user as any).isReadOnly) {
      return NextResponse.json({ error: "Modo demo solo permite visualización" }, { status: 403 })
    }

    const { crearPublicacion } = await import("@/lib/actions/publicaciones")
    const body = await request.json()

    // Sanitizar inputs de texto para prevenir XSS
    const datosSanitizados = sanitizeObject({
      color: body.color,
      descripcion: body.descripcion,
      edad: body.edad,
      ubicacion: body.ubicacion,
      contactoNombre: body.contactoNombre,
      contactoTelefono: body.contactoTelefono,
      contactoEmail: body.contactoEmail,
    })

    // Usar el usuarioId de la sesion, NO del body (previene suplantacion)
    const publicacion = await crearPublicacion({
      tipoPublicacion: body.tipoPublicacion as "perdida" | "adopcion" | "buscada",
      especie: body.especie,
      raza: body.raza,
      sexo: body.sexo,
      color: datosSanitizados.color,
      descripcion: datosSanitizados.descripcion,
      edad: datosSanitizados.edad,
      imagenUrl: body.imagenUrl || "",
      ubicacion: datosSanitizados.ubicacion,
      fechaEncuentro: body.fechaEncuentro ? new Date(body.fechaEncuentro) : undefined,
      contactoNombre: datosSanitizados.contactoNombre,
      contactoTelefono: datosSanitizados.contactoTelefono,
      contactoEmail: datosSanitizados.contactoEmail,
      mostrarContactoPublico: !!body.mostrarContactoPublico,
      usuarioId: session.user.id,
      transitoUrgente: !!body.transitoUrgente,
      esPrueba: !!body.esPrueba,
    }, { forceDemo: isDemoRequest(request) })

    return NextResponse.json({ publicacion }, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[API /publicaciones POST] Error creating publicacion:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ error: "Error al crear publicacion" }, { status: 500 })
  }
}
