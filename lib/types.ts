export type Sexo = "macho" | "hembra" | "desconocido";

// Nuevo tipo simplificado que combina especie + sexo
export type TipoMascota = "perro" | "perra" | "gato" | "gata" | "otro";

// Mantener Especie para compatibilidad interna con DB
export type Especie = "perro" | "gato" | "otro";

// Helpers para derivar especie y sexo del TipoMascota
export function tipoMascotaToEspecie(tipo: TipoMascota): Especie {
  if (tipo === "perro" || tipo === "perra") return "perro";
  if (tipo === "gato" || tipo === "gata") return "gato";
  return "otro";
}

export function tipoMascotaToSexo(tipo: TipoMascota): Sexo {
  if (tipo === "perro" || tipo === "gato") return "macho";
  if (tipo === "perra" || tipo === "gata") return "hembra";
  return "desconocido";
}

export function especieSexoToTipo(especie: Especie, sexo: Sexo): TipoMascota {
  if (especie === "perro") return sexo === "hembra" ? "perra" : "perro";
  if (especie === "gato") return sexo === "hembra" ? "gata" : "gato";
  return "otro";
}

export type Raza =
  // Razas de perro
  | "mestizo"
  | "mestizo_perro"
  | "labrador"
  | "golden_retriever"
  | "golden"
  | "bulldog"
  | "pastor_aleman"
  | "pastor_australiano"
  | "shar_pei"
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
  | "otra";

export interface Mascota {
  id: string;
  especie: Especie;
  raza: Raza;
  padreRaza?: Raza | null;
  madreRaza?: Raza | null;
  sexo: Sexo;
  color: string;
  descripcion: string;
  fechaNacimiento?: Date | null;
  imagenUrl: string;
}

export type TipoPublicacion = "perdida" | "adopcion" | "buscada";

export interface Publicacion {
  id: string;
  tipoPublicacion: TipoPublicacion;
  mascota: Mascota;
  ubicacion: string;
  fechaPublicacion: Date;
  fechaEncuentro?: Date | null;
  contactoNombre: string;
  contactoTelefono: string;
  contactoEmail: string;
  mostrarContactoPublico: boolean;
  usuarioId: string;
  activa: boolean;
  transitoUrgente?: boolean;
  esRefugio?: boolean;
  transitoContactoNombre?: string | null;
  transitoContactoTelefono?: string | null;
  transitoContactoEmail?: string | null;
  historialTransferencias?: Array<{
    nombre: string;
    telefono: string;
    email: string;
    fecha: string;
  }> | null;
}

export interface Usuario {
  id: string;
  nombreUsuario: string;
  email: string;
  fechaRegistro: Date;
  isReadOnly?: boolean; // true para usuarios demo (modo solo lectura)
  esRefugio?: boolean;
  nombreRefugio?: string | null;
  ubicacion?: string | null;
  contactoNombre?: string | null;
  contactoTelefono?: string | null;
  contactoEmail?: string | null;
  mostrarContactoPublico?: boolean;
}
