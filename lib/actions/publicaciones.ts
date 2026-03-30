"use server"

import { eq, and, or, ilike, desc } from "drizzle-orm"
import type { Especie, Sexo, Raza } from "@/lib/types"
import { mockPublicaciones } from "@/lib/mock-data"
import { isDemoHost } from "@/lib/env"
import type { Publicacion } from "@/lib/types"
import type { publicaciones as publicacionesTable } from "@/lib/db/schema"

const isDemoEnv = isDemoHost(undefined)

async function enrichPublicacionesWithRefugioProfile(publicaciones: Publicacion[]): Promise<Publicacion[]> {
  if (publicaciones.length === 0) return publicaciones

  const { getRefugioProfileMapByAuthUserIds } = await import("@/lib/actions/refugios")
  const profileMap = await getRefugioProfileMapByAuthUserIds(publicaciones.map((p) => p.usuarioId))

  return publicaciones.map((pub) => {
    const profile = profileMap.get(pub.usuarioId)
    if (!profile) return { ...pub, esRefugio: false }

    return {
      ...pub,
      esRefugio: profile.esRefugio,
      contactoNombre: profile.esRefugio && profile.nombreRefugio ? profile.nombreRefugio : pub.contactoNombre,
    }
  })
}

async function enrichPublicacionWithRefugioProfile(publicacion: Publicacion): Promise<Publicacion> {
  const [result] = await enrichPublicacionesWithRefugioProfile([publicacion])
  return result
}

// ─── Tipos para las queries ─────────────────────────────────
interface FiltrosPublicaciones {
  tipoPublicacion?: "perdida" | "adopcion" | "buscada"
  especie?: Especie | "todos"
  raza?: string | "todos"
  sexo?: Sexo | "todos"
  ubicacion?: string
  transitoUrgente?: boolean
  soloEnTransito?: boolean
  soloActivas?: boolean
  usuarioId?: string
  soloRefugios?: boolean
}

// ─── SELECT: Obtener publicaciones ──────────────────────────
export async function getPublicaciones(filtros?: FiltrosPublicaciones, opts?: { forceDemo?: boolean }) {
  const conditions: any[] = []

  // Filtrar publicaciones de prueba si no estamos en modo demo
  const isDemo = opts?.forceDemo ?? isDemoEnv
  let rows: any[] = []

  // Intentar cargar desde la base de datos primero
  try {
    const { db } = await import("@/lib/db")
    const { publicaciones } = await import("@/lib/db/schema")

    if (!isDemo) {
      conditions.push(eq(publicaciones.esPrueba, false))
    }

    if (filtros?.soloActivas !== false) {
      conditions.push(eq(publicaciones.activa, true))
    }

    if (filtros?.tipoPublicacion) {
      conditions.push(eq(publicaciones.tipoPublicacion, filtros.tipoPublicacion))
    }

    if (filtros?.especie && filtros.especie !== "todos") {
      conditions.push(eq(publicaciones.especie, filtros.especie))
    }

    if (filtros?.raza && filtros.raza !== "todos") {
      conditions.push(eq(publicaciones.raza, filtros.raza))
    }

    if (filtros?.sexo && filtros.sexo !== "todos") {
      conditions.push(eq(publicaciones.sexo, filtros.sexo))
    }

    if (filtros?.ubicacion) {
      conditions.push(ilike(publicaciones.ubicacion, `%${filtros.ubicacion}%`))
    }

    if (filtros?.transitoUrgente) {
      conditions.push(eq(publicaciones.transitoUrgente, true))
    }

    if (filtros?.usuarioId) {
      conditions.push(eq(publicaciones.usuarioId, filtros.usuarioId))
    }

    rows = await db
      .select()
      .from(publicaciones)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(publicaciones.fechaPublicacion))
  } catch (error) {
    console.error("Error loading from database, falling back to mocks:", error)
    rows = []
  }

  // Transformar a las interfaces del frontend
  let result = rows.map(mapRowToPublicacion)

  // En produccion, reflejar el flag esRefugio desde perfil de usuario
  if (!isDemo) {
    result = await enrichPublicacionesWithRefugioProfile(result)
    if (filtros?.soloRefugios) {
      result = result.filter((pub) => pub.esRefugio === true)
    }
  }

  // Inyectar mocks estaticos si estamos en demo
  if (isDemo) {
    const mockFiltradas = mockPublicaciones.filter((pub) => {
      if (filtros?.soloActivas !== false) {
        if (!pub.activa) return false
      }
      if (filtros?.tipoPublicacion && pub.tipoPublicacion !== filtros.tipoPublicacion) return false
      if (filtros?.especie && filtros.especie !== "todos" && pub.mascota.especie !== filtros.especie) return false
      if (filtros?.raza && filtros.raza !== "todos" && pub.mascota.raza !== filtros.raza) return false
      if (filtros?.sexo && filtros.sexo !== "todos" && pub.mascota.sexo !== filtros.sexo) return false
      if (filtros?.ubicacion && !pub.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())) return false
      if (filtros?.transitoUrgente && !pub.transitoUrgente) return false
      return true
    })

    // Keep original usuarioId for refugios so profile routes (/refugio/[usuarioId]) work in demo.
    // Non-refugio mocks remain owned by demo-admin for current demo behavior.
    const mockAdjusted = mockFiltradas.map((p) =>
      p.esRefugio ? p : { ...p, usuarioId: "demo-admin" }
    )
    // Agregamos las de prueba primero
    result = [...mockAdjusted, ...result]
  }

  return result
}

// ─── SELECT: Obtener publicacion por ID ─────────────────────
export async function getPublicacionById(id: string, opts?: { forceDemo?: boolean }) {
  const isDemo = opts?.forceDemo ?? isDemoEnv

  // Buscar primero en los mocks si es demo
  if (isDemo) {
    const mockPub = mockPublicaciones.find((p) => p.id === id)
    if (mockPub) return mockPub.esRefugio ? mockPub : { ...mockPub, usuarioId: "demo-admin" }
  }

  // Si no es demo, consultar la DB (lazy-import)
  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")
  const conditions = [eq(publicaciones.id, id)]
  if (!isDemo) {
    conditions.push(eq(publicaciones.esPrueba, false))
  }

  const rows = await db
    .select()
    .from(publicaciones)
    .where(and(...conditions))
    .limit(1)

  if (rows.length === 0) return null
  const mapped = mapRowToPublicacion(rows[0])
  return enrichPublicacionWithRefugioProfile(mapped)
}

// ─── INSERT: Crear publicacion ──────────────────────────────
export async function crearPublicacion(data: {
  tipoPublicacion: "perdida" | "adopcion" | "buscada"
  especie: string
  raza: string
  sexo: string
  color: string
  descripcion: string
  edad?: string
  imagenUrl?: string
  ubicacion: string
  fechaEncuentro?: Date
  contactoNombre: string
  contactoTelefono: string
  contactoEmail: string
  mostrarContactoPublico: boolean
  usuarioId: string
  transitoUrgente?: boolean
  esPrueba?: boolean
  padreRaza?: string
  madreRaza?: string
}) {
  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")

  const [row] = await db
    .insert(publicaciones)
    .values({
      tipoPublicacion: data.tipoPublicacion,
      especie: data.especie,
      raza: data.raza,
      padreRaza: data.padreRaza || null,
      madreRaza: data.madreRaza || null,
      sexo: data.sexo,
      color: data.color,
      descripcion: data.descripcion,
      edad: data.edad,
      imagenUrl: data.imagenUrl || "",
      ubicacion: data.ubicacion,
      fechaEncuentro: data.fechaEncuentro || null,
      contactoNombre: data.contactoNombre,
      contactoTelefono: data.contactoTelefono,
      contactoEmail: data.contactoEmail,
      mostrarContactoPublico: data.mostrarContactoPublico,
      usuarioId: data.usuarioId,
      transitoUrgente: data.transitoUrgente ?? false,
      esPrueba: data.esPrueba ?? false,
    })
    .returning()

  return mapRowToPublicacion(row)
}

// ─── UPDATE: Cerrar publicacion ─────────────────────────────
export async function cerrarPublicacionDB(
  id: string,
  motivo: "encontrado_dueno" | "adoptado" | "en_transito" | "otro",
  transitoContacto?: {
    nombre: string
    telefono: string
    email: string
  },
  historialActualizado?: Array<{ nombre: string; telefono: string; email: string; fecha: string }>
) {
  const updateData: Record<string, unknown> = {
    activa: false,
    motivoCierre: motivo,
  }

  // Si es transito, guardar datos del nuevo cuidador
  if (motivo === "en_transito" && transitoContacto) {
    updateData.transitoContactoNombre = transitoContacto.nombre
    updateData.transitoContactoTelefono = transitoContacto.telefono
    updateData.transitoContactoEmail = transitoContacto.email
  }

  // Si hay historial actualizado (segunda transferencia), guardarlo
  if (historialActualizado) {
    updateData.historialTransferencias = historialActualizado
  }

  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")

  const [row] = await db
    .update(publicaciones)
    .set(updateData)
    .where(eq(publicaciones.id, id))
    .returning()

  return row ? mapRowToPublicacion(row) : null
}

// ─── UPDATE: Actualizar publicacion ─────────────────────────
export async function actualizarPublicacionDB(
  id: string,
  datos: Partial<{
    descripcion: string
    ubicacion: string
    contactoNombre: string
    contactoTelefono: string
    contactoEmail: string
    imagenUrl: string
    activa: boolean
    transitoUrgente: boolean
    esPrueba: boolean
  }>
) {

  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")

  const [row] = await db
    .update(publicaciones)
    .set(datos)
    .where(eq(publicaciones.id, id))
    .returning()

  return row ? mapRowToPublicacion(row) : null
}

// ─── DELETE: Eliminar publicacion ──────────────────────────
export async function eliminarPublicacionDB(id: string) {
  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")

  const [row] = await db
    .delete(publicaciones)
    .where(eq(publicaciones.id, id))
    .returning()

  return row ? mapRowToPublicacion(row) : null
}

// ─── Contador de mascotas reunidas ──────────────────────────
export async function contarMascotasReunidas() {
  const conditions = [
    // lazy-import schema for conditions
    // (we'll import publicaciones below)
  ]
  const { db } = await import("@/lib/db")
  const { publicaciones } = await import("@/lib/db/schema")

  conditions.push(eq(publicaciones.activa, false))

  // Filtrar publicaciones de prueba si no estamos en modo demo
  if (!isDemoEnv) {
    conditions.push(eq(publicaciones.esPrueba, false))
  }

  const rows = await db
    .select()
    .from(publicaciones)
    .where(and(...conditions))

  return rows.length
}

// ─── Helper: mapear row de DB a interface del frontend ──────
function mapRowToPublicacion(row: typeof publicacionesTable.$inferSelect): Publicacion {
  return {
    id: row.id,
    tipoPublicacion: row.tipoPublicacion as "perdida" | "adopcion",
    mascota: {
      id: row.id, // Usamos el mismo ID ya que no hay tabla separada
      especie: row.especie as Especie,
      raza: row.raza as any,
        padreRaza: row.padreRaza as Raza | undefined,
        madreRaza: row.madreRaza as Raza | undefined,
      sexo: row.sexo as Sexo,
      color: row.color,
      descripcion: row.descripcion,
      edad: row.edad,
      imagenUrl: row.imagenUrl || "",
    },
    ubicacion: row.ubicacion,
    fechaPublicacion: row.fechaPublicacion,
    fechaEncuentro: row.fechaEncuentro,
    contactoNombre: row.contactoNombre,
    contactoTelefono: row.contactoTelefono,
    contactoEmail: row.contactoEmail,
    mostrarContactoPublico: row.mostrarContactoPublico,
    usuarioId: row.usuarioId,
    activa: row.activa,
    esPrueba: row.esPrueba,
    transitoUrgente: row.transitoUrgente,
    transitoContactoNombre: row.transitoContactoNombre,
    transitoContactoTelefono: row.transitoContactoTelefono,
    transitoContactoEmail: row.transitoContactoEmail,
    historialTransferencias: row.historialTransferencias as any,
  }
}
