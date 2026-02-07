import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "../lib/db/schema"

// Cargar .env manualmente para scripts
import { config } from "dotenv"
config()

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no configurada. Crear archivo .env con la URL de Neon.")
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql, { schema })

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + (process.env.PASSWORD_SALT || "encontratumascota-salt"))
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function seed() {
  console.log("🌱 Iniciando seed...")

  // 1. Crear usuario admin
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@encontratumascota.com.ar"
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"
  const adminName = process.env.NEXT_PUBLIC_ADMIN_NAME || "Eugenio"

  const passwordHash = await hashPassword(adminPassword)

  const [adminUser] = await db
    .insert(schema.usuarios)
    .values({
      nombreUsuario: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      fechaRegistro: new Date("2026-01-01"),
    })
    .onConflictDoNothing({ target: schema.usuarios.email })
    .returning()

  if (!adminUser) {
    console.log("⚠️  Usuario admin ya existe, obteniendo ID...")
    const existing = await db.query.usuarios.findFirst({
      where: (u, { eq }) => eq(u.email, adminEmail.toLowerCase()),
    })
    if (!existing) {
      console.error("❌ No se pudo obtener el usuario admin")
      process.exit(1)
    }
    var adminId = existing.id
  } else {
    var adminId = adminUser.id
  }

  console.log(`✅ Usuario admin: ${adminId}`)

  // 2. Insertar publicaciones mock
  const publicacionesData = [
    {
      especie: "perro",
      raza: "labrador",
      sexo: "macho",
      color: "Dorado",
      descripcion: "Perro labrador joven, muy amigable. Tiene un collar azul pero sin identificacion. Parece bien cuidado.",
      imagenUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      ubicacion: "Palermo, CABA",
      fechaEncuentro: new Date("2026-01-24"),
      fechaPublicacion: new Date("2026-01-25"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
      transitoUrgente: true,
    },
    {
      especie: "gato",
      raza: "siames",
      sexo: "hembra",
      color: "Crema con puntas oscuras",
      descripcion: "Gata siamesa adulta, muy tranquila. Encontrada cerca de una plaza, busca refugio en portales.",
      imagenUrl: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop",
      ubicacion: "Belgrano, CABA",
      fechaEncuentro: new Date("2026-01-23"),
      fechaPublicacion: new Date("2026-01-24"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "mestizo",
      sexo: "macho",
      color: "Negro con pecho blanco",
      descripcion: "Perro mediano mestizo, muy asustadizo pero no agresivo. Tiene una cicatriz en la oreja derecha.",
      imagenUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
      ubicacion: "Villa Crespo, CABA",
      fechaEncuentro: new Date("2026-01-22"),
      fechaPublicacion: new Date("2026-01-23"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "gato",
      raza: "comun_europeo",
      sexo: "desconocido",
      color: "Atigrado gris",
      descripcion: "Gato adulto atigrado, muy sociable. Parece acostumbrado a vivir en casa. Encontrado en un jardin.",
      imagenUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
      ubicacion: "Caballito, CABA",
      fechaEncuentro: new Date("2026-01-21"),
      fechaPublicacion: new Date("2026-01-22"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "caniche",
      sexo: "hembra",
      color: "Blanco",
      descripcion: "Caniche toy blanca, muy pequena y nerviosa. Tiene el pelo un poco descuidado. Sin collar.",
      imagenUrl: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=300&fit=crop",
      ubicacion: "Recoleta, CABA",
      fechaEncuentro: new Date("2026-01-20"),
      fechaPublicacion: new Date("2026-01-21"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
      transitoUrgente: true,
    },
    {
      especie: "perro",
      raza: "golden_retriever",
      sexo: "macho",
      color: "Dorado oscuro",
      descripcion: "Golden retriever adulto, muy docil y jugueton. Tiene collar rojo sin chapita. Bien alimentado.",
      imagenUrl: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=300&fit=crop",
      ubicacion: "Nunez, CABA",
      fechaEncuentro: new Date("2026-01-19"),
      fechaPublicacion: new Date("2026-01-20"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "gato",
      raza: "persa",
      sexo: "hembra",
      color: "Blanco puro",
      descripcion: "Gata persa blanca, pelo largo y sedoso. Muy mansa y acostumbrada a estar adentro. Encontrada en un balcon.",
      imagenUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop",
      ubicacion: "San Telmo, CABA",
      fechaEncuentro: new Date("2026-01-18"),
      fechaPublicacion: new Date("2026-01-19"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "beagle",
      sexo: "macho",
      color: "Tricolor",
      descripcion: "Beagle adulto tricolor, orejas largas caracteristicas. Muy activo y amigable con otros perros.",
      imagenUrl: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=300&fit=crop",
      ubicacion: "Flores, CABA",
      fechaEncuentro: new Date("2026-01-17"),
      fechaPublicacion: new Date("2026-01-18"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
      activa: false,
      enTransito: true,
      transitoUrgente: true,
    },
    {
      especie: "perro",
      raza: "bulldog",
      sexo: "hembra",
      color: "Atigrado",
      descripcion: "Bulldog frances atigrada, joven y juguetona. Tiene un arnes rosa puesto. Muy sociable.",
      imagenUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
      ubicacion: "Almagro, CABA",
      fechaEncuentro: new Date("2026-01-16"),
      fechaPublicacion: new Date("2026-01-17"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "gato",
      raza: "comun_europeo",
      sexo: "macho",
      color: "Negro",
      descripcion: "Gato negro adulto, ojos amarillos muy expresivos. Tranquilo y carinoso. Busca comida en negocios.",
      imagenUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
      ubicacion: "Boedo, CABA",
      fechaEncuentro: new Date("2026-01-15"),
      fechaPublicacion: new Date("2026-01-16"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "pastor_aleman",
      sexo: "macho",
      color: "Negro y fuego",
      descripcion: "Pastor aleman joven, muy noble pero algo timido. Tiene collar de cuero marron. Bien entrenado.",
      imagenUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
      ubicacion: "Colegiales, CABA",
      fechaEncuentro: new Date("2026-01-14"),
      fechaPublicacion: new Date("2026-01-15"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "gato",
      raza: "siames",
      sexo: "macho",
      color: "Seal point",
      descripcion: "Gato siames joven, muy vocal y demandante de atencion. Ojos azules intensos. Muy limpio.",
      imagenUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop",
      ubicacion: "Chacarita, CABA",
      fechaEncuentro: new Date("2026-01-13"),
      fechaPublicacion: new Date("2026-01-14"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "mestizo",
      sexo: "hembra",
      color: "Marron claro",
      descripcion: "Perra mestiza mediana, muy dulce y tranquila. Parece mayor, camina despacio. Necesita atencion.",
      imagenUrl: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=300&fit=crop",
      ubicacion: "Parque Patricios, CABA",
      fechaEncuentro: new Date("2026-01-12"),
      fechaPublicacion: new Date("2026-01-13"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "otro",
      raza: "otra",
      sexo: "desconocido",
      color: "Gris",
      descripcion: "Conejo gris domestico encontrado en una plaza. Muy manso, se deja agarrar. Parece mascota.",
      imagenUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
      ubicacion: "Villa Devoto, CABA",
      fechaEncuentro: new Date("2026-01-11"),
      fechaPublicacion: new Date("2026-01-12"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
    {
      especie: "perro",
      raza: "labrador",
      sexo: "hembra",
      color: "Negro",
      descripcion: "Labradora negra adulta, muy obediente y tranquila. Tiene chip pero no pudimos leerlo. Espera a su familia.",
      imagenUrl: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&h=300&fit=crop",
      ubicacion: "Saavedra, CABA",
      fechaEncuentro: new Date("2026-01-10"),
      fechaPublicacion: new Date("2026-01-11"),
      contactoNombre: adminName,
      contactoTelefono: "+54 11 1234-5678",
      contactoEmail: "eugenio@encontratumascota.com.ar",
      usuarioId: adminId,
    },
  ]

  for (const pub of publicacionesData) {
    await db.insert(schema.publicaciones).values(pub)
  }

  console.log(`✅ ${publicacionesData.length} publicaciones creadas`)
  console.log("🎉 Seed completado")
}

seed().catch((e) => {
  console.error("❌ Error en seed:", e)
  process.exit(1)
})
