"use server"

import { eq, inArray, desc } from "drizzle-orm"

export interface RefugioProfile {
  authUserId: string
  esRefugio: boolean
  nombreRefugio?: string | null
  contactoNombre?: string | null
  contactoTelefono?: string | null
  contactoEmail?: string | null
  mostrarContactoPublico?: boolean
}

export async function setRefugioProfile(input: RefugioProfile) {
  const { db } = await import("@/lib/db")
  const { usuariosPerfil } = await import("@/lib/db/schema")

  const [row] = await db
    .insert(usuariosPerfil)
    .values({
      authUserId: input.authUserId,
      esRefugio: input.esRefugio,
      nombreRefugio: input.nombreRefugio ?? null,
      contactoNombre: input.contactoNombre ?? null,
      contactoTelefono: input.contactoTelefono ?? null,
      contactoEmail: input.contactoEmail ?? null,
      mostrarContactoPublico: input.mostrarContactoPublico ?? false,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: usuariosPerfil.authUserId,
      set: {
        esRefugio: input.esRefugio,
        nombreRefugio: input.nombreRefugio ?? null,
        contactoNombre: input.contactoNombre ?? null,
        contactoTelefono: input.contactoTelefono ?? null,
        contactoEmail: input.contactoEmail ?? null,
        mostrarContactoPublico: input.mostrarContactoPublico ?? false,
        updatedAt: new Date(),
      },
    })
    .returning()

  return row
}

export async function getRefugioProfileByAuthUserId(authUserId: string) {
  const { db } = await import("@/lib/db")
  const { usuariosPerfil } = await import("@/lib/db/schema")

  const rows = await db
    .select()
    .from(usuariosPerfil)
    .where(eq(usuariosPerfil.authUserId, authUserId))
    .limit(1)

  return rows[0] ?? null
}

export async function getRefugioProfileMapByAuthUserIds(authUserIds: string[]) {
  if (authUserIds.length === 0) return new Map<string, RefugioProfile>()

  const uniqueIds = Array.from(new Set(authUserIds.filter(Boolean)))
  if (uniqueIds.length === 0) return new Map<string, RefugioProfile>()

  const { db } = await import("@/lib/db")
  const { usuariosPerfil } = await import("@/lib/db/schema")

  const rows = await db
    .select()
    .from(usuariosPerfil)
    .where(inArray(usuariosPerfil.authUserId, uniqueIds))

  const profileMap = new Map<string, RefugioProfile>()
  for (const row of rows) {
    profileMap.set(row.authUserId, {
      authUserId: row.authUserId,
      esRefugio: row.esRefugio,
      nombreRefugio: row.nombreRefugio,
      contactoNombre: row.contactoNombre,
      contactoTelefono: row.contactoTelefono,
      contactoEmail: row.contactoEmail,
      mostrarContactoPublico: row.mostrarContactoPublico,
    })
  }

  return profileMap
}

export async function listRefugioProfiles(onlyRefugios = true) {
  const { db } = await import("@/lib/db")
  const { usuariosPerfil } = await import("@/lib/db/schema")

  const rows = await db
    .select()
    .from(usuariosPerfil)
    .where(onlyRefugios ? eq(usuariosPerfil.esRefugio, true) : undefined)
    .orderBy(desc(usuariosPerfil.updatedAt))

  return rows
}
