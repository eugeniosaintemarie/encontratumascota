"use client"

import { createAuthClient } from "@neondatabase/auth/next"

export const authClient = createAuthClient()

/**
 * Cierra la sesion navegando al endpoint server-side /api/auth/logout.
 * El server se encarga de invalidar la sesion upstream y borrar las cookies
 * HttpOnly (que no son accesibles desde JS), y luego redirige a /.
 */
export function logout() {
  window.location.href = "/api/auth/logout"
}
