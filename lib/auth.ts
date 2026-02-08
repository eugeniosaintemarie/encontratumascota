import type { Usuario } from "./types"

// ─── Mapear usuario de Neon Auth a nuestro tipo ──────────────
export function mapNeonUser(user: {
  id: string
  name: string
  email: string
  createdAt: Date
}): Usuario {
  return {
    id: user.id,
    nombreUsuario: user.name,
    email: user.email,
    fechaRegistro: new Date(user.createdAt),
  }
}
