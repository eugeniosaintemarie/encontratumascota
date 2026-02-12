import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core"
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

// ─── Publicaciones ──────────────────────────────────────────
export const publicaciones = pgTable("publicaciones", {
  id: text("id").$defaultFn(shortId).primaryKey(),

  // Datos de la mascota (inline, sin tabla separada para simplificar)
  especie: text("especie").notNull(), // "perro" | "gato" | "otro"
  raza: text("raza").notNull(),
  sexo: text("sexo").notNull(), // "macho" | "hembra" | "desconocido"
  color: text("color").notNull(),
  descripcion: text("descripcion").notNull(),
  imagenUrl: text("imagen_url").default(""),

  // Datos de la publicacion
  ubicacion: text("ubicacion").notNull(),
  fechaPublicacion: timestamp("fecha_publicacion", { withTimezone: true }).defaultNow().notNull(),
  fechaEncuentro: timestamp("fecha_encuentro", { withTimezone: true }).notNull(),

  // Contacto
  contactoNombre: text("contacto_nombre").notNull(),
  contactoTelefono: text("contacto_telefono").notNull(),
  contactoEmail: text("contacto_email").notNull(),

  // Relacion con usuario (Neon Auth usa IDs de texto)
  usuarioId: text("usuario_id").notNull(),

  // Estado
  activa: boolean("activa").default(true).notNull(),
  enTransito: boolean("en_transito").default(false).notNull(),
  transitoUrgente: boolean("transito_urgente").default(false).notNull(),
  motivoCierre: text("motivo_cierre"), // null = abierta

  // Contacto de transito (persona que se queda con la mascota temporalmente)
  // Los campos contacto_* originales se mantienen como respaldo del usuario que publico
  transitoContactoNombre: text("transito_contacto_nombre"),
  transitoContactoTelefono: text("transito_contacto_telefono"),
  transitoContactoEmail: text("transito_contacto_email"),
})
