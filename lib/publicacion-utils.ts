import type { Publicacion, Mascota } from "./types"
import { especieSexoToTipo } from "./types"
import { tipoMascotaLabels, razasLabels } from "./labels"
import { isMestizoRaza, truncateUbicacion } from "./utils"

export interface PublicacionInfo {
  tipo: string
  raza: string
  razaDetalle?: string
  madreRaza?: string
  padreRaza?: string
  esMestizo: boolean
  ubicacion: string
  ubicacionCorta: string
  edadOFecha: string
  esAdopcion: boolean
  transitoUrgente: boolean
  categoria: string
  color: string
  descripcion: string
}

export function getPublicacionInfo(publicacion: Publicacion): PublicacionInfo {
  const { mascota } = publicacion
  const esHembra = mascota.sexo === "hembra"
  const tipo = tipoMascotaLabels[especieSexoToTipo(mascota.especie, mascota.sexo)]
  const esMestizo = isMestizoRaza(mascota.raza)
  
  let raza: string
  let razaDetalle: string | undefined
  let madreRaza: string | undefined
  let padreRaza: string | undefined
  if (esMestizo) {
    raza = esHembra ? "Mestiza" : "Mestizo"
    const padre = mascota.padreRaza ? razasLabels[mascota.padreRaza] || mascota.padreRaza : "?"
    const madre = mascota.madreRaza ? razasLabels[mascota.madreRaza] || mascota.madreRaza : "?"
    madreRaza = `♀ ${madre}`
    padreRaza = `♂ ${padre}`
    razaDetalle = `(${madreRaza} ${padreRaza})`
  } else {
    raza =razasLabels[mascota.raza] || mascota.raza
  }

  if (esMestizo) {
    raza = ""
  }

  const ubicacionCorta = truncateUbicacion(publicacion.ubicacion)

  let edadOFecha = ""
  if (publicacion.tipoPublicacion === "adopcion") {
    edadOFecha = formatEdadFromDate(mascota.fechaNacimiento)
  } else if (publicacion.fechaEncuentro && publicacion.fechaEncuentro.getFullYear() > 1970) {
    edadOFecha = formatDate(publicacion.fechaEncuentro)
  }

  let categoria: string
  if (publicacion.tipoPublicacion === "adopcion") {
    categoria = "En adopción"
  } else if (publicacion.tipoPublicacion === "buscada") {
    categoria = esHembra ? "Buscada" : "Buscado"
  } else {
    categoria = esHembra ? "Encontrada" : "Encontrado"
  }

  return {
    tipo,
    raza,
    razaDetalle,
    madreRaza,
    padreRaza,
    esMestizo,
    ubicacion: publicacion.ubicacion,
    ubicacionCorta,
    edadOFecha,
    esAdopcion: publicacion.tipoPublicacion === "adopcion",
    transitoUrgente: publicacion.transitoUrgente ?? false,
    categoria,
    color: mascota.color,
    descripcion: mascota.descripcion,
  }
}

export function formatEdad(edad?: string | null): string {
  if (!edad) return ""
  const parts = edad.trim().split(/\s+/)
  if (parts.length < 2) return edad
  const num = parseInt(parts[0], 10)
  if (isNaN(num)) return edad
  const unidad = parts[1].toLowerCase()
  if (unidad.startsWith("año")) {
    return num === 1 ? "1 año" : `${num} años`
  }
  if (unidad.startsWith("día") || unidad.startsWith("dia")) {
    return num === 1 ? "1 día" : `${num} días`
  }
  return edad
}

export function formatEdadFromDate(fechaNacimiento?: Date | null): string {
  if (!fechaNacimiento) return ""
  const hoy = new Date()
  const nacimiento = new Date(fechaNacimiento)
  const diffMs = hoy.getTime() - nacimiento.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDias < 0) return ""
  
  if (diffDias < 30) {
    return diffDias === 1 ? "1 día" : `${diffDias} días`
  }
  
  if (diffDias < 365) {
    const meses = Math.floor(diffDias / 30)
    return meses === 1 ? "1 mes" : `${meses} meses`
  }
  
  const años = Math.floor(diffDias / 365)
  return años === 1 ? "1 año" : `${años} años`
}

export function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function getShareText(publicacion: Publicacion): string {
  const info = getPublicacionInfo(publicacion)
  const transitoTag = info.transitoUrgente ? " ¡Tránsito urgente!" : ""
  
  let title: string
  if (info.esAdopcion) {
    title = `${info.tipo} ${info.raza}${info.razaDetalle ? ` ${info.razaDetalle}` : ""}${info.color ? ` ${info.color}` : ""} ${info.categoria.toLowerCase()}${transitoTag}`
  } else {
    title = `${info.tipo} ${info.raza}${info.razaDetalle ? ` ${info.razaDetalle}` : ""}${info.color ? ` ${info.color}` : ""} ${info.categoria.toLowerCase()} en ${info.ubicacionCorta}${transitoTag}`
  }
  
  return `${title}\n\n${info.descripcion}\n\n${typeof window !== "undefined" ? window.location.origin : ""}/publicacion/${publicacion.id}`
}
