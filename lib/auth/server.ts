import { createNeonAuth } from "@neondatabase/auth/next/server"

// Lazy singleton para evitar errores en build-time cuando
// las env vars no estan disponibles.
let _auth: ReturnType<typeof createNeonAuth> | null = null

export function getAuth() {
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
export async function getServerSession() {
  try {
    const auth = getAuth()
    const { data } = await auth.getSession()
    if (!data?.user) return null
    return data
  } catch {
    return null
  }
}
