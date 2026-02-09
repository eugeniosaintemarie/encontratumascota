"use client"

import { createAuthClient } from "@neondatabase/auth/next"

export const authClient = createAuthClient()

/**
 * Cierra la sesion haciendo POST directo al endpoint y limpiando cookies.
 * Bypasea authClient.signOut() que puede fallar silenciosamente.
 */
export async function logout() {
  try {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
  } catch {
    // Ignorar errores de red — limpiamos igual
  }
  // Borrar cookies accesibles desde el cliente (safety net)
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim()
    if (name.includes("neon-auth") || name.includes("better-auth") || name.includes("session")) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
      document.cookie = `${name}=; Max-Age=0; Path=/; Secure`
    }
  })
  window.location.href = "/"
}
