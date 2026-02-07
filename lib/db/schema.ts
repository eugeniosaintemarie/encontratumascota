import { pgTable, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core"

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
  id: uuid("id").defaultRandom().primaryKey(),

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

  // Relacion con usuario
  usuarioId: uuid("usuario_id").references(() => usuarios.id).notNull(),

  // Estado
  activa: boolean("activa").default(true).notNull(),
  enTransito: boolean("en_transito").default(false).notNull(),
  transitoUrgente: boolean("transito_urgente").default(false).notNull(),
  motivoCierre: text("motivo_cierre"), // null = abierta

  // Flag de prueba — se oculta cuando SHOW_TEST_DATA != "on"
  esPrueba: boolean("es_prueba").default(false).notNull(),
})
