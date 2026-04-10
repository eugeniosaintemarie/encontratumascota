import type { Raza, Especie, Sexo, TipoMascota } from "./types";
import { tipoMascotaToEspecie } from "./types";

export const razasPorEspecie: Record<
  Especie,
  { value: Raza; label: string }[]
> = {
  perro: [
    { value: "beagle", label: "Beagle" },
    { value: "bulldog", label: "Bulldog" },
    { value: "caniche", label: "Caniche" },
    { value: "golden", label: "Golden retriever" },
    { value: "labrador", label: "Labrador" },
    { value: "mestizo_perro", label: "Mestizo" },
    { value: "otro_perro", label: "Otro" },
    { value: "pastor_aleman", label: "Pastor alemán" },
    { value: "pastor_australiano", label: "Pastor australiano" },
    { value: "shar_pei", label: "Shar-Pei" },
  ],
  gato: [
    { value: "comun_europeo", label: "Común europeo" },
    { value: "maine_coon", label: "Maine coon" },
    { value: "mestizo_gato", label: "Mestizo" },
    { value: "otro_gato", label: "Otro" },
    { value: "persa", label: "Persa" },
    { value: "siames", label: "Siamés" },
  ],
  otro: [{ value: "otro_animal", label: "Otro animal" }],
};

// Helper para obtener razas por TipoMascota
export function getRazasPorTipoMascota(tipo: TipoMascota) {
  return razasPorEspecie[tipoMascotaToEspecie(tipo)];
}

export const razasLabels: Record<Raza, string> = {
  mestizo: "Mestizo",
  mestizo_perro: "Mestizo",
  labrador: "Labrador",
  golden_retriever: "Golden Retriever",
  golden: "Golden Retriever",
  bulldog: "Bulldog",
  pastor_aleman: "Pastor alemán",
  pastor_australiano: "Pastor australiano",
  shar_pei: "Shar-Pei",
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
};

export const especieLabels: Record<Especie, string> = {
  perro: "Perro",
  gato: "Gato",
  otro: "Otro",
};

export const generoLabels: Record<Sexo, string> = {
  macho: "Macho",
  hembra: "Hembra",
  desconocido: "Desconocido",
};

export const tipoMascotaLabels: Record<TipoMascota, string> = {
  perro: "Perro",
  perra: "Perra",
  gato: "Gato",
  gata: "Gata",
  otro: "Otro",
};
