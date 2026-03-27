import { pgTable, text, timestamp, boolean, uuid, json } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

// Helper: genera un ID corto alfanumérico (10 chars)
const shortId = () => nanoid(10)

// ─── Usuarios ───────────────────────────────────────────────
export const usuarios = pgTable("usuarios", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombreUsuario: text("nombre_usuario").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fechaRegistro: timestamp("fecha_registro", { withTimezone: true }).defaultNow().notNull(),
})

// Perfil extendido por usuario de auth (produccion)
// Guardamos flags de negocio desacoplados de Neon Auth.
export const usuariosPerfil = pgTable("usuarios_perfil", {
  authUserId: text("auth_user_id").primaryKey(),
  esRefugio: boolean("es_refugio").default(false).notNull(),
  nombreRefugio: text("nombre_refugio"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

// ─── Publicaciones ──────────────────────────────────────────
export const publicaciones = pgTable("publicaciones", {
  id: text("id").$defaultFn(shortId).primaryKey(),

  // Datos de la mascota (inline, sin tabla separada para simplificar)
  especie: text("especie").notNull(), // "perro" | "gato" | "otro"
  raza: text("raza").notNull(),
  sexo: text("sexo").notNull(), // "macho" | "hembra" | "desconocido"
  color: text("color").notNull(),
  descripcion: text("descripcion").notNull(),
  edad: text("edad"), // Solo para adopcion: "~ X años o meses"
  imagenUrl: text("imagen_url").default(""),

  // Datos de la publicacion
  tipoPublicacion: text("tipo_publicacion").default("perdida").notNull(), // "perdida" | "adopcion" | "buscada"
  ubicacion: text("ubicacion").notNull(),
  fechaPublicacion: timestamp("fecha_publicacion", { withTimezone: true }).defaultNow().notNull(),
  fechaEncuentro: timestamp("fecha_encuentro", { withTimezone: true }), // Solo para perdida

  // Contacto
  contactoNombre: text("contacto_nombre").notNull(),
  contactoTelefono: text("contacto_telefono").notNull(),
  contactoEmail: text("contacto_email").notNull(),
  mostrarContactoPublico: boolean("mostrar_contacto_publico").default(false).notNull(),

  // Relacion con usuario (Neon Auth usa IDs de texto)
  usuarioId: text("usuario_id").notNull(),

  // Estado
  activa: boolean("activa").default(true).notNull(),
  esPrueba: boolean("es_prueba").default(false).notNull(),
  transitoUrgente: boolean("transito_urgente").default(false).notNull(),
  motivoCierre: text("motivo_cierre"), // null = abierta

  // Contacto de transito (persona que se queda con la mascota temporalmente)
  // Los campos contacto_* originales se mantienen como respaldo del usuario que publico
  transitoContactoNombre: text("transito_contacto_nombre"),
  transitoContactoTelefono: text("transito_contacto_telefono"),
  transitoContactoEmail: text("transito_contacto_email"),

  // Historial de transferencias (JSON array de cuidadores anteriores)
  // Estructura: [{ nombre: string, telefono: string, email: string, fecha: timestamp }, ...]
  historialTransferencias: json("historial_transferencias").$type<Array<{
    nombre: string
    telefono: string
    email: string
    fecha: string // ISO timestamp
  }>>().default([]),
})
