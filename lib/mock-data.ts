import type { Publicacion, Raza, Especie, Sexo } from "./types"

// Todas las publicaciones estan asociadas al usuario admin
const ADMIN_USER_ID = "admin"

export const publicacionesMock: Publicacion[] = [
  {
    id: "1",
    mascota: {
      id: "m1",
      especie: "perro",
      raza: "labrador",
      sexo: "macho",
      color: "Dorado",
      descripcion:
        "Perro labrador joven, muy amigable. Tiene un collar azul pero sin identificacion. Parece bien cuidado.",
      imagenUrl:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    },
    ubicacion: "Palermo, CABA",
    fechaPublicacion: new Date("2026-01-25"),
    fechaEncuentro: new Date("2026-01-24"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
    transitoUrgente: true,
  },
  {
    id: "2",
    mascota: {
      id: "m2",
      especie: "gato",
      raza: "siames",
      sexo: "hembra",
      color: "Crema con puntas oscuras",
      descripcion:
        "Gata siamesa adulta, muy tranquila. Encontrada cerca de una plaza, busca refugio en portales.",
      imagenUrl:
        "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=300&fit=crop",
    },
    ubicacion: "Belgrano, CABA",
    fechaPublicacion: new Date("2026-01-24"),
    fechaEncuentro: new Date("2026-01-23"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "3",
    mascota: {
      id: "m3",
      especie: "perro",
      raza: "mestizo",
      sexo: "macho",
      color: "Negro con pecho blanco",
      descripcion:
        "Perro mediano mestizo, muy asustadizo pero no agresivo. Tiene una cicatriz en la oreja derecha.",
      imagenUrl:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
    },
    ubicacion: "Villa Crespo, CABA",
    fechaPublicacion: new Date("2026-01-23"),
    fechaEncuentro: new Date("2026-01-22"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "4",
    mascota: {
      id: "m4",
      especie: "gato",
      raza: "comun_europeo",
      sexo: "desconocido",
      color: "Atigrado gris",
      descripcion:
        "Gato adulto atigrado, muy sociable. Parece acostumbrado a vivir en casa. Encontrado en un jardin.",
      imagenUrl:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
    },
    ubicacion: "Caballito, CABA",
    fechaPublicacion: new Date("2026-01-22"),
    fechaEncuentro: new Date("2026-01-21"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "5",
    mascota: {
      id: "m5",
      especie: "perro",
      raza: "caniche",
      sexo: "hembra",
      color: "Blanco",
      descripcion:
        "Caniche toy blanca, muy pequena y nerviosa. Tiene el pelo un poco descuidado. Sin collar.",
      imagenUrl:
        "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=300&fit=crop",
    },
    ubicacion: "Recoleta, CABA",
    fechaPublicacion: new Date("2026-01-21"),
    fechaEncuentro: new Date("2026-01-20"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
    transitoUrgente: true,
  },
  {
    id: "6",
    mascota: {
      id: "m6",
      especie: "perro",
      raza: "golden_retriever",
      sexo: "macho",
      color: "Dorado oscuro",
      descripcion:
        "Golden retriever adulto, muy docil y jugueton. Tiene collar rojo sin chapita. Bien alimentado.",
      imagenUrl:
        "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=300&fit=crop",
    },
    ubicacion: "Nunez, CABA",
    fechaPublicacion: new Date("2026-01-20"),
    fechaEncuentro: new Date("2026-01-19"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "7",
    mascota: {
      id: "m7",
      especie: "gato",
      raza: "persa",
      sexo: "hembra",
      color: "Blanco puro",
      descripcion:
        "Gata persa blanca, pelo largo y sedoso. Muy mansa y acostumbrada a estar adentro. Encontrada en un balcon.",
      imagenUrl:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop",
    },
    ubicacion: "San Telmo, CABA",
    fechaPublicacion: new Date("2026-01-19"),
    fechaEncuentro: new Date("2026-01-18"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "8",
    mascota: {
      id: "m8",
      especie: "perro",
      raza: "beagle",
      sexo: "macho",
      color: "Tricolor",
      descripcion:
        "Beagle adulto tricolor, orejas largas caracteristicas. Muy activo y amigable con otros perros.",
      imagenUrl:
        "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=300&fit=crop",
    },
    ubicacion: "Flores, CABA",
    fechaPublicacion: new Date("2026-01-18"),
    fechaEncuentro: new Date("2026-01-17"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: false,
    enTransito: true,
    transitoUrgente: true,
    transitoContactoNombre: "María López",
    transitoContactoTelefono: "+54 11 9876-5432",
    transitoContactoEmail: "maria.lopez@gmail.com",
  },
  {
    id: "9",
    mascota: {
      id: "m9",
      especie: "perro",
      raza: "bulldog",
      sexo: "hembra",
      color: "Atigrado",
      descripcion:
        "Bulldog frances atigrada, joven y juguetona. Tiene un arnes rosa puesto. Muy sociable.",
      imagenUrl:
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=300&fit=crop",
    },
    ubicacion: "Almagro, CABA",
    fechaPublicacion: new Date("2026-01-17"),
    fechaEncuentro: new Date("2026-01-16"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "10",
    mascota: {
      id: "m10",
      especie: "gato",
      raza: "comun_europeo",
      sexo: "macho",
      color: "Negro",
      descripcion:
        "Gato negro adulto, ojos amarillos muy expresivos. Tranquilo y carinoso. Busca comida en negocios.",
      imagenUrl:
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
    },
    ubicacion: "Boedo, CABA",
    fechaPublicacion: new Date("2026-01-16"),
    fechaEncuentro: new Date("2026-01-15"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "11",
    mascota: {
      id: "m11",
      especie: "perro",
      raza: "pastor_aleman",
      sexo: "macho",
      color: "Negro y fuego",
      descripcion:
        "Pastor aleman joven, muy noble pero algo timido. Tiene collar de cuero marron. Bien entrenado.",
      imagenUrl:
        "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=300&fit=crop",
    },
    ubicacion: "Colegiales, CABA",
    fechaPublicacion: new Date("2026-01-15"),
    fechaEncuentro: new Date("2026-01-14"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "12",
    mascota: {
      id: "m12",
      especie: "gato",
      raza: "siames",
      sexo: "macho",
      color: "Seal point",
      descripcion:
        "Gato siames joven, muy vocal y demandante de atencion. Ojos azules intensos. Muy limpio.",
      imagenUrl:
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop",
    },
    ubicacion: "Chacarita, CABA",
    fechaPublicacion: new Date("2026-01-14"),
    fechaEncuentro: new Date("2026-01-13"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "13",
    mascota: {
      id: "m13",
      especie: "perro",
      raza: "mestizo",
      sexo: "hembra",
      color: "Marron claro",
      descripcion:
        "Perra mestiza mediana, muy dulce y tranquila. Parece mayor, camina despacio. Necesita atencion.",
      imagenUrl:
        "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=300&fit=crop",
    },
    ubicacion: "Parque Patricios, CABA",
    fechaPublicacion: new Date("2026-01-13"),
    fechaEncuentro: new Date("2026-01-12"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "14",
    mascota: {
      id: "m14",
      especie: "otro",
      raza: "otra",
      sexo: "desconocido",
      color: "Gris",
      descripcion:
        "Conejo gris domestico encontrado en una plaza. Muy manso, se deja agarrar. Parece mascota.",
      imagenUrl:
        "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=300&fit=crop",
    },
    ubicacion: "Villa Devoto, CABA",
    fechaPublicacion: new Date("2026-01-12"),
    fechaEncuentro: new Date("2026-01-11"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
  {
    id: "15",
    mascota: {
      id: "m15",
      especie: "perro",
      raza: "labrador",
      sexo: "hembra",
      color: "Negro",
      descripcion:
        "Labradora negra adulta, muy obediente y tranquila. Tiene chip pero no pudimos leerlo. Espera a su familia.",
      imagenUrl:
        "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&h=300&fit=crop",
    },
    ubicacion: "Saavedra, CABA",
    fechaPublicacion: new Date("2026-01-11"),
    fechaEncuentro: new Date("2026-01-10"),
    contactoNombre: "Eugenio",
    contactoTelefono: "+54 11 1234-5678",
    contactoEmail: "eugenio@encontratumascota.com.ar",
    usuarioId: ADMIN_USER_ID,
    activa: true,
  },
]

export const razasLabels: Record<Raza, string> = {
  mestizo: "Mestizo",
  mestizo_perro: "Mestizo",
  labrador: "Labrador",
  golden_retriever: "Golden Retriever",
  golden: "Golden Retriever",
  bulldog: "Bulldog",
  pastor_aleman: "Pastor Alemán",
  caniche: "Caniche",
  beagle: "Beagle",
  otro_perro: "Otro",
  mestizo_gato: "Mestizo",
  siames: "Siamés",
  persa: "Persa",
  maine_coon: "Maine Coon",
  comun_europeo: "Común Europeo",
  otro_gato: "Otro",
  otro_animal: "Otro",
  otra: "Otra",
}

export const especieLabels: Record<Especie, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Otro",
}

export const generoLabels: Record<Sexo, string> = {
  macho: "Macho",
  hembra: "Hembra",
  desconocido: "Desconocido",
}
