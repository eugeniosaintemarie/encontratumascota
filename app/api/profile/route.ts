import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth/server"
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/lib/sanitize-server"

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(request)
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const authUserId = String(session.user.id)

    const { getRefugioProfileByAuthUserId, setRefugioProfile } = await import("@/lib/actions/refugios")
    const existingProfile = await getRefugioProfileByAuthUserId(authUserId)

    const contactoNombre = sanitizeText(body?.contactoNombre ?? existingProfile?.contactoNombre ?? "")
    const contactoTelefono = sanitizePhone(body?.contactoTelefono ?? existingProfile?.contactoTelefono ?? "")
    const contactoEmail = sanitizeEmail(body?.contactoEmail ?? existingProfile?.contactoEmail ?? "")
    const mostrarContactoPublico = Boolean(
      body?.mostrarContactoPublico ?? existingProfile?.mostrarContactoPublico ?? false
    )
    const ubicacion = sanitizeText(body?.ubicacion ?? existingProfile?.ubicacion ?? "")

    const updatedProfile = await setRefugioProfile({
      authUserId,
      esRefugio: existingProfile?.esRefugio ?? false,
      nombreRefugio: existingProfile?.nombreRefugio ?? null,
      ubicacion: ubicacion || null,
      contactoNombre: contactoNombre || null,
      contactoTelefono: contactoTelefono || null,
      contactoEmail: contactoEmail || null,
      mostrarContactoPublico,
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error interno"
    console.error("[API /profile PATCH]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
