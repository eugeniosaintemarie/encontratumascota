export type Sexo = "macho" | "hembra" | "desconocido"

export type Especie = "perro" | "gato" | "otro"

export type Raza =
  | "mestizo"
  | "labrador"
  | "golden_retriever"
  | "bulldog"
  | "pastor_aleman"
  | "caniche"
  | "beagle"
  | "siames"
  | "persa"
  | "comun_europeo"
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
}

export interface Usuario {
  id: string
  nombreUsuario: string
  email: string
  fechaRegistro: Date
}
