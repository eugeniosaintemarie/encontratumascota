import { createNeonAuth } from "@neondatabase/auth/next/server"
import { isDemoRequest } from "@/lib/env"

// Lazy singleton para evitar errores en build-time cuando
// las env vars no estan disponibles.
let _auth: ReturnType<typeof createNeonAuth> | null = null
let envStatusLogged = false

function logNeonAuthEnvStatus() {
  if (envStatusLogged) return
  envStatusLogged = true
  const missingVars = []
  if (!process.env.NEON_AUTH_BASE_URL) missingVars.push("NEON_AUTH_BASE_URL")
  if (!process.env.NEON_AUTH_COOKIE_SECRET) missingVars.push("NEON_AUTH_COOKIE_SECRET")
  console.debug(
    `[getAuth] Neon Auth env status - missing: ${missingVars.length ? missingVars.join(", ") : "none"}`
  )
}

export function getAuth() {
  logNeonAuthEnvStatus()
  if (!_auth) {
    _auth = createNeonAuth({
      baseUrl: process.env.NEON_AUTH_BASE_URL!,
      cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
      },
    })
  }
  return _auth
}

/**
 * Obtiene la sesion del usuario autenticado.
 * Retorna { user, session } o null si no hay sesion valida.
 */
export async function getServerSession(request?: Request) {
  // If we're in demo mode for this request and a demo cookie is present, return a fake session
  if (isDemoRequest(request) && request) {
    try {
      const cookieHeader = request.headers.get("cookie") || ""
      const parts = cookieHeader.split(";").map((s) => s.trim())
      const demoCookie = parts.find((p) => p.startsWith("demo_session="))
      if (demoCookie) {
        const encoded = demoCookie.split("=")[1]
        const decoded = Buffer.from(decodeURIComponent(encoded), "base64").toString("utf-8")
        const payload = JSON.parse(decoded)
        if (payload?.user) {
          return { user: payload.user }
        }
      }
    } catch (e) {
      // ignore and fallback to real session
      console.error("[getServerSession] demo session parse error:", e)
    }
  }

  try {
    const auth = getAuth()
    const { data } = await auth.getSession()
    if (!data?.user) return null
    return data
  } catch (error) {
    console.error("[getServerSession] Neon Auth request failed", error)
    return null
  }
}
