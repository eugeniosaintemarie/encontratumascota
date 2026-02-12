import type { Usuario } from "./types"

// ─── Admin user from env vars (fallback when no DB) ────────
export const ADMIN_USER: { id: string; nombreUsuario: string; email: string; password: string; fechaRegistro: Date } = {
  id: "admin",
  nombreUsuario: process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin",
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "",
  fechaRegistro: new Date("2026-01-01"),
}

// Usuarios especiales que saltean validaciones de formato
const SPECIAL_USERS: Record<string, { id: string; nombreUsuario: string; email: string; fechaRegistro: Date }> = {
  demo: {
    id: "demo",
    nombreUsuario: "Usuario Demo",
    email: "demo",
    fechaRegistro: new Date("2026-01-01"),
  },
  admin: {
    id: "admin",
    nombreUsuario: "Administrador",
    email: "admin",
    fechaRegistro: new Date("2026-01-01"),
  },
}

// Funcion para validar credenciales (local, sin DB)
export function validateCredentials(email: string, password: string): Usuario | null {
  // Atajo para usuarios especiales (demo/demo, admin/admin)
  const specialUser = SPECIAL_USERS[email?.toLowerCase()]
  if (specialUser && password === email?.toLowerCase()) {
    return specialUser
  }

  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    const { password: _, ...user } = ADMIN_USER
    return user
  }
  return null
}

// Funcion para obtener usuario actual desde localStorage
export function getCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null
  
  const stored = localStorage.getItem("currentUser")
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Reconstituir fechas
      if (parsed.fechaRegistro) {
        parsed.fechaRegistro = new Date(parsed.fechaRegistro)
      }
      return parsed
    } catch {
      return null
    }
  }
  return null
}

// Funcion para guardar usuario actual
export function setCurrentUser(user: Usuario | null): void {
  if (typeof window === "undefined") return
  
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

// Funcion para cerrar sesion
export function logout(): void {
  setCurrentUser(null)
}
