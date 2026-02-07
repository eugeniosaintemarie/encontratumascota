import type { Usuario } from "./types"

// Usuario admin - credenciales desde variables de entorno
export const ADMIN_USER: Usuario & { password: string } = {
  id: "admin",
  nombreUsuario: process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin",
  email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "",
  fechaRegistro: new Date("2026-01-01"),
}

// Funcion para validar credenciales
export function validateCredentials(email: string, password: string): Usuario | null {
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    // Retornar usuario sin la password
    const { password: _, ...user } = ADMIN_USER
    return user
  }
  return null
}

// Funcion para obtener usuario actual (simulado)
export function getCurrentUser(): Usuario | null {
  if (typeof window === "undefined") return null
  
  const stored = localStorage.getItem("currentUser")
  if (stored) {
    try {
      return JSON.parse(stored)
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
