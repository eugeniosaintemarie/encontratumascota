"use client"

let authClientInstance: any = null

async function getAuthClientInstance() {
  if (!authClientInstance) {
    try {
      const { createAuthClient } = await import("@neondatabase/auth/next")
      authClientInstance = createAuthClient()
    } catch (error) {
      console.error("Error initializing Neon Auth client:", error)
      throw error
    }
  }
  return authClientInstance
}

export const authClient = {
  signIn: {
    async email(data: any) {
      const client = await getAuthClientInstance()
      return client.signIn.email(data)
    },
    async social(data: any) {
      const client = await getAuthClientInstance()
      return client.signIn.social(data)
    },
  },
  signUp: {
    async email(data: any) {
      const client = await getAuthClientInstance()
      return client.signUp.email(data)
    },
  },
  async changePassword(data: any) {
    const client = await getAuthClientInstance()
    return client.changePassword(data)
  },
}

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
