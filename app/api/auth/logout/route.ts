import { NextResponse } from "next/server"
import { cookies } from "next/headers"

/**
 * Endpoint dedicado para cerrar sesion.
 * Borra todas las cookies de Neon Auth y redirige a /.
 * Se navega directamente con window.location.href para garantizar
 * que el browser procese los Set-Cookie antes de cargar la pagina.
 */
export async function GET(request: Request) {
  // Intentar llamar al upstream sign-out para invalidar la sesion server-side
  const baseUrl = process.env.NEON_AUTH_BASE_URL
  if (baseUrl) {
    try {
      const cookieStore = await cookies()
      const cookieHeader = cookieStore.getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ")

      const origin = new URL(request.url).origin

      await fetch(`${baseUrl}/sign-out`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
          Origin: origin,
        },
        body: "{}",
      })
    } catch (e) {
      console.error("[logout] upstream sign-out failed:", e)
    }
  }

  // Redirigir a home
  const response = NextResponse.redirect(new URL("/", request.url))

  // Borrar TODAS las cookies de neon-auth.
  // IMPORTANTE: usamos solo headers.append() porque response.cookies.set()
  // de Next.js sobreescribe headers Set-Cookie previos al setear nuevos.
  const cookieNames = [
    "__Secure-neon-auth.session_token",
    "__Secure-neon-auth.session_data",
    "__Secure-neon-auth.local.session_data",
    "__Secure-neon-auth.dont_remember",
    "__Secure-neon-auth.session_challange",
  ]

  for (const name of cookieNames) {
    // Variante SameSite=Lax
    response.headers.append(
      "Set-Cookie",
      `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`
    )
    // Variante SameSite=None; Partitioned (usada por neon-auth upstream)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=None; Partitioned`
    )
  }

  return response
}
