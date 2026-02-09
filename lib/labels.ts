import type { Raza, Especie, Sexo } from "./types"

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
