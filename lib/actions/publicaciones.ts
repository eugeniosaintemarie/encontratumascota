"use server"

import { db } from "@/lib/db"
import { publicaciones } from "@/lib/db/schema"
import { eq, and, or, ilike, desc } from "drizzle-orm"
import type { Especie, Sexo } from "@/lib/types"

// ─── Tipos para las queries ─────────────────────────────────
interface FiltrosPublicaciones {
  especie?: Especie | "todos"
  sexo?: Sexo | "todos"
  ubicacion?: string
  transitoUrgente?: boolean
  soloActivas?: boolean
  soloEnTransito?: boolean
}

// ─── SELECT: Obtener publicaciones ──────────────────────────
export async function getPublicaciones(filtros?: FiltrosPublicaciones) {
  const conditions = []

  // Filtrar publicaciones de prueba si no estamos en modo demo
  if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") {
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

  if (filtros?.especie && filtros.especie !== "todos") {
    conditions.push(eq(publicaciones.especie, filtros.especie))
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
  return rows.map(mapRowToPublicacion)
}

// ─── SELECT: Obtener publicacion por ID ─────────────────────
export async function getPublicacionById(id: string) {
  const conditions = [eq(publicaciones.id, id)]

  // Filtrar publicaciones de prueba si no estamos en modo demo
  if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") {
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
  especie: string
  raza: string
  sexo: string
  color: string
  descripcion: string
  imagenUrl?: string
  ubicacion: string
  fechaEncuentro: Date
  contactoNombre: string
  contactoTelefono: string
  contactoEmail: string
  usuarioId: string
  transitoUrgente?: boolean
  esPrueba?: boolean
}) {
  const [row] = await db
    .insert(publicaciones)
    .values({
      especie: data.especie,
      raza: data.raza,
      sexo: data.sexo,
      color: data.color,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl || "",
      ubicacion: data.ubicacion,
      fechaEncuentro: data.fechaEncuentro,
      contactoNombre: data.contactoNombre,
      contactoTelefono: data.contactoTelefono,
      contactoEmail: data.contactoEmail,
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
  if (process.env.NEXT_PUBLIC_IS_DEMO !== "true") {
    conditions.push(eq(publicaciones.esPrueba, false))
  }

  const rows = await db
    .select()
    .from(publicaciones)
    .where(and(...conditions))

  return rows.length
}

// ─── Helper: mapear row de DB a interface del frontend ──────
function mapRowToPublicacion(row: typeof publicaciones.$inferSelect) {
  return {
    id: row.id,
    mascota: {
      id: row.id, // Usamos el mismo ID ya que no hay tabla separada
      especie: row.especie as Especie,
      raza: row.raza as any,
      sexo: row.sexo as Sexo,
      color: row.color,
      descripcion: row.descripcion,
      imagenUrl: row.imagenUrl || "",
    },
    ubicacion: row.ubicacion,
    fechaPublicacion: row.fechaPublicacion,
    fechaEncuentro: row.fechaEncuentro,
    contactoNombre: row.contactoNombre,
    contactoTelefono: row.contactoTelefono,
    contactoEmail: row.contactoEmail,
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
