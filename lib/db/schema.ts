import {
  pgTable,
  text,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Helper: genera un ID corto alfanumérico (10 chars)
const shortId = () => nanoid(10);

// Perfil extendido por usuario de auth (produccion)
// Guardamos flags de negocio desacoplados de Neon Auth.
export const usuariosPerfil = pgTable("usuarios_perfil", {
  authUserId: text("auth_user_id").primaryKey(),
  esRefugio: boolean("es_refugio").default(false).notNull(),
  nombreRefugio: text("nombre_refugio"),
  ubicacion: text("ubicacion"),
  contactoNombre: text("contacto_nombre"),
  contactoTelefono: text("contacto_telefono"),
  contactoEmail: text("contacto_email"),
  mostrarContactoPublico: boolean("mostrar_contacto_publico")
    .default(false)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ─── Publicaciones ──────────────────────────────────────────
export const publicaciones = pgTable("publicaciones", {
  id: text("id").$defaultFn(shortId).primaryKey(),

  // Datos de la mascota (inline, sin tabla separada para simplificar)
  especie: text("especie").notNull(), // "perro" | "gato" | "otro"
  raza: text("raza").notNull(),
  padreRaza: text("padre_raza"),
  madreRaza: text("madre_raza"),
  sexo: text("sexo").notNull(), // "macho" | "hembra" | "desconocido"
  color: text("color").notNull(),
  descripcion: text("descripcion").notNull(),
  fechaNacimiento: timestamp("fecha_nacimiento"), // Para adopcion: fecha de nacimiento
  imagenUrl: text("imagen_url").default(""),

  // Datos de la publicacion
  tipoPublicacion: text("tipo_publicacion").default("perdida").notNull(), // "perdida" | "adopcion" | "buscada"
  ubicacion: text("ubicacion").notNull(),
  fechaPublicacion: timestamp("fecha_publicacion", { withTimezone: true })
    .defaultNow()
    .notNull(),
  fechaEncuentro: timestamp("fecha_encuentro", { withTimezone: true }), // Solo para perdida

  // Contacto
  contactoNombre: text("contacto_nombre").notNull(),
  contactoTelefono: text("contacto_telefono").notNull(),
  contactoEmail: text("contacto_email").notNull(),
  mostrarContactoPublico: boolean("mostrar_contacto_publico")
    .default(false)
    .notNull(),

  // Relacion con usuario (Neon Auth usa IDs de texto)
  usuarioId: text("usuario_id").notNull(),

  // Estado
  activa: boolean("activa").default(true).notNull(),
  transitoUrgente: boolean("transito_urgente").default(false).notNull(),
  motivoCierre: text("motivo_cierre"), // null = abierta

  // Contacto de transito (persona que se queda con la mascota temporalmente)
  // Los campos contacto_* originales se mantienen como respaldo del usuario que publico
  transitoContactoNombre: text("transito_contacto_nombre"),
  transitoContactoTelefono: text("transito_contacto_telefono"),
  transitoContactoEmail: text("transito_contacto_email"),

  // Historial de transferencias (JSON array de cuidadores anteriores)
  // Estructura: [{ nombre: string, telefono: string, email: string, fecha: timestamp }, ...]
  historialTransferencias: json("historial_transferencias")
    .$type<
      Array<{
        nombre: string;
        telefono: string;
        email: string;
        fecha: string; // ISO timestamp
      }>
    >()
    .default([]),
});
