import type { Usuario } from "./types"

// Usuario admin hardcodeado para pruebas
export const ADMIN_USER: Usuario & { password: string } = {
  id: "admin",
  nombreUsuario: "Eugenio",
  email: "e.saintemarie@outlook.com",
  password: "LaFerrariRojaDeUge1000",
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
