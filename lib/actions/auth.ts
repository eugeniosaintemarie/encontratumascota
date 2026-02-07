"use server"

import { db } from "@/lib/db"
import { usuarios } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import type { Usuario } from "@/lib/types"

// ─── Registro de usuario ────────────────────────────────────
export async function registrarUsuario(data: {
  nombre: string
  email: string
  password: string
}) {
  // Verificar si el email ya existe
  const existente = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, data.email.toLowerCase()))
    .limit(1)

  if (existente.length > 0) {
    return { error: "Ya existe una cuenta con ese email" }
  }

  // Hash simple para el MVP (en produccion usar bcrypt)
  // Usamos un hash basico con la Web Crypto API
  const passwordHash = await hashPassword(data.password)

  const [row] = await db
    .insert(usuarios)
    .values({
      nombreUsuario: data.nombre,
      email: data.email.toLowerCase(),
      passwordHash,
    })
    .returning()

  return {
    user: {
      id: row.id,
      nombreUsuario: row.nombreUsuario,
      email: row.email,
      fechaRegistro: row.fechaRegistro,
    } as Usuario,
  }
}

// ─── Login ──────────────────────────────────────────────────
export async function loginUsuario(email: string, password: string) {
  const rows = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email.toLowerCase()))
    .limit(1)

  if (rows.length === 0) {
    return { error: "Email o contraseña incorrectos" }
  }

  const row = rows[0]
  const passwordHash = await hashPassword(password)

  if (row.passwordHash !== passwordHash) {
    return { error: "Email o contraseña incorrectos" }
  }

  return {
    user: {
      id: row.id,
      nombreUsuario: row.nombreUsuario,
      email: row.email,
      fechaRegistro: row.fechaRegistro,
    } as Usuario,
  }
}

// ─── Obtener usuario por ID ─────────────────────────────────
export async function getUsuarioById(id: string) {
  const rows = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, id))
    .limit(1)

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    id: row.id,
    nombreUsuario: row.nombreUsuario,
    email: row.email,
    fechaRegistro: row.fechaRegistro,
  } as Usuario
}

// ─── Cambiar contraseña ─────────────────────────────────────
export async function cambiarPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const rows = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, userId))
    .limit(1)

  if (rows.length === 0) {
    return { error: "Usuario no encontrado" }
  }

  const row = rows[0]
  const currentHash = await hashPassword(currentPassword)

  if (row.passwordHash !== currentHash) {
    return { error: "La contraseña actual es incorrecta" }
  }

  const newHash = await hashPassword(newPassword)

  await db
    .update(usuarios)
    .set({ passwordHash: newHash })
    .where(eq(usuarios.id, userId))

  return { success: true }
}

// ─── Hash helper (SHA-256 para MVP) ─────────────────────────
// En produccion se deberia usar bcrypt/argon2
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || "encontratumascota-salt"))
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
