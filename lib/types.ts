export type Sexo = "macho" | "hembra" | "desconocido"

export type Especie = "perro" | "gato" | "otro"

export type Raza =
  // Razas de perro
  | "mestizo"
  | "mestizo_perro"
  | "labrador"
  | "golden_retriever"
  | "golden"
  | "bulldog"
  | "pastor_aleman"
  | "caniche"
  | "beagle"
  | "otro_perro"
  // Razas de gato
  | "mestizo_gato"
  | "siames"
  | "persa"
  | "maine_coon"
  | "comun_europeo"
  | "otro_gato"
  // Otros animales
  | "otro_animal"
  | "otra"

export interface Mascota {
  id: string
  especie: Especie
  raza: Raza
  sexo: Sexo
  color: string
  descripcion: string
  imagenUrl: string
}

export interface Publicacion {
  id: string
  mascota: Mascota
  ubicacion: string
  fechaPublicacion: Date
  fechaEncuentro: Date
  contactoNombre: string
  contactoTelefono: string
  contactoEmail: string
  usuarioId: string
  activa: boolean
  enTransito?: boolean
}

export interface Usuario {
  id: string
  nombreUsuario: string
  email: string
  fechaRegistro: Date
}
