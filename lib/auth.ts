import type { Usuario } from "./types"

// ─── Mapear usuario de Neon Auth a nuestro tipo ──────────────
export function mapNeonUser(user: {
  id: string
  name: string
  email: string
  createdAt: Date | string
  isReadOnly?: boolean
  esRefugio?: boolean
  nombreRefugio?: string | null
  ubicacion?: string | null
  contactoNombre?: string | null
  contactoTelefono?: string | null
  contactoEmail?: string | null
  mostrarContactoPublico?: boolean
}): Usuario {
  return {
    id: user.id,
    nombreUsuario: user.name,
    email: user.email,
    fechaRegistro: new Date(user.createdAt),
    isReadOnly: user.isReadOnly,
    esRefugio: user.esRefugio,
    nombreRefugio: user.nombreRefugio,
    ubicacion: user.ubicacion ?? null,
    contactoNombre: user.contactoNombre ?? null,
    contactoTelefono: user.contactoTelefono ?? null,
    contactoEmail: user.contactoEmail ?? null,
    mostrarContactoPublico: user.mostrarContactoPublico ?? false,
  }
}
