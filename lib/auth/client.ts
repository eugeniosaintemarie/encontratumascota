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

export async function fetchServerSession() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (!res.ok) return null
    const data = await res.json()
    return data?.user ?? null
  } catch (e) {
    return null
  }
}
