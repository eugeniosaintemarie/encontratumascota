"use server"

import { db } from "@/lib/db"
import { publicaciones } from "@/lib/db/schema"
import { eq, and, or, ilike, desc } from "drizzle-orm"
import type { Especie, Sexo } from "@/lib/types"
import { mockPublicaciones } from "@/lib/mock-data"
import { isDemoHost } from "@/lib/env"
import type { Publicacion } from "@/lib/types"

const isDemoEnv = isDemoHost(undefined)

// ─── Tipos para las queries ─────────────────────────────────
interface FiltrosPublicaciones {
  tipoPublicacion?: "perdida" | "adopcion"
  especie?: Especie | "todos"
  raza?: string | "todos"
  sexo?: Sexo | "todos"
  ubicacion?: string
  transitoUrgente?: boolean
  soloActivas?: boolean
  soloEnTransito?: boolean
}

// ─── SELECT: Obtener publicaciones ──────────────────────────
export async function getPublicaciones(filtros?: FiltrosPublicaciones, opts?: { forceDemo?: boolean }) {
  const conditions = []

  // Filtrar publicaciones de prueba si no estamos en modo demo
  const isDemo = opts?.forceDemo ?? isDemoEnv
  if (!isDemo) {
    conditions.push(eq(publicaciones.esPrueba, false))
  }

  if (filtros?.soloActivas !== false) {
    // Por defecto traer activas + en transito (excluir cerradas definitivamente)
    if (filtros?.soloEnTransito) {
      conditions.push(eq(publicaciones.enTransito, true))
    } else {
      conditions.push(
        or(
          eq(publicaciones.activa, true),
          eq(publicaciones.enTransito, true)
        )
      )
    }
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

  const rows = await db
    .select()
    .from(publicaciones)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(publicaciones.fechaPublicacion))

  // Transformar a las interfaces del frontend
  let result = rows.map(mapRowToPublicacion)

  // Inyectar mocks estaticos si estamos en demo
  if (isDemo) {
    const mockFiltradas = mockPublicaciones.filter((pub) => {
      if (filtros?.soloActivas !== false) {
        if (filtros?.soloEnTransito && !pub.enTransito) return false
        if (!filtros?.soloEnTransito && !pub.activa && !pub.enTransito) return false
      }
      if (filtros?.tipoPublicacion && pub.tipoPublicacion !== filtros.tipoPublicacion) return false
      if (filtros?.especie && filtros.especie !== "todos" && pub.mascota.especie !== filtros.especie) return false
      if (filtros?.raza && filtros.raza !== "todos" && pub.mascota.raza !== filtros.raza) return false
      if (filtros?.sexo && filtros.sexo !== "todos" && pub.mascota.sexo !== filtros.sexo) return false
      if (filtros?.ubicacion && !pub.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase())) return false
      if (filtros?.transitoUrgente && !pub.transitoUrgente) return false
      return true
    })

    // Force mock publicaciones to belong to demo-admin so demo shows admin-owned posts
    const mockAdjusted = mockFiltradas.map((p) => ({ ...p, usuarioId: "demo-admin" }))
    // Agregamos las de prueba primero
    result = [...mockAdjusted, ...result]
  }

  return result
}

// ─── SELECT: Obtener publicacion por ID ─────────────────────
export async function getPublicacionById(id: string, opts?: { forceDemo?: boolean }) {
  const conditions = [eq(publicaciones.id, id)]

  const isDemo = opts?.forceDemo ?? isDemoEnv

  // Buscar primero en los mocks si es demo
  if (isDemo) {
    const mockPub = mockPublicaciones.find((p) => p.id === id)
    if (mockPub) return { ...mockPub, usuarioId: "demo-admin" }
  }

  // Filtrar publicaciones de prueba si no estamos en modo demo
  if (!isDemo) {
    conditions.push(eq(publicaciones.esPrueba, false))
  }

  const rows = await db
    .select()
    .from(publicaciones)
    .where(and(...conditions))
    .limit(1)

  if (rows.length === 0) return null
  return mapRowToPublicacion(rows[0])
}

// ─── INSERT: Crear publicacion ──────────────────────────────
export async function crearPublicacion(data: {
  tipoPublicacion: "perdida" | "adopcion"
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
}) {
  const [row] = await db
    .insert(publicaciones)
    .values({
      tipoPublicacion: data.tipoPublicacion,
      especie: data.especie,
      raza: data.raza,
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
  }
) {
  const updateData: Record<string, unknown> = {
    activa: false,
    enTransito: motivo === "en_transito",
    motivoCierre: motivo,
  }

  // Si es transito, guardar datos del nuevo cuidador
  if (motivo === "en_transito" && transitoContacto) {
    updateData.transitoContactoNombre = transitoContacto.nombre
    updateData.transitoContactoTelefono = transitoContacto.telefono
    updateData.transitoContactoEmail = transitoContacto.email
  }

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
    enTransito: boolean
    transitoUrgente: boolean
    esPrueba: boolean
  }>
) {
  const [row] = await db
    .update(publicaciones)
    .set(datos)
    .where(eq(publicaciones.id, id))
    .returning()

  return row ? mapRowToPublicacion(row) : null
}

// ─── Contador de mascotas reunidas ──────────────────────────
export async function contarMascotasReunidas() {
  const conditions = [
    eq(publicaciones.activa, false),
    eq(publicaciones.enTransito, false),
  ]

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
function mapRowToPublicacion(row: typeof publicaciones.$inferSelect): Publicacion {
  return {
    id: row.id,
    tipoPublicacion: row.tipoPublicacion as "perdida" | "adopcion",
    mascota: {
      id: row.id, // Usamos el mismo ID ya que no hay tabla separada
      especie: row.especie as Especie,
      raza: row.raza as any,
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
    enTransito: row.enTransito,
    transitoUrgente: row.transitoUrgente,
    transitoContactoNombre: row.transitoContactoNombre,
    transitoContactoTelefono: row.transitoContactoTelefono,
    transitoContactoEmail: row.transitoContactoEmail,
  }
}
