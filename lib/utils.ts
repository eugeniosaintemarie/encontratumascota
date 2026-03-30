import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHeartEmojiSpacing(value: string): string {
  return value.replace(/(\S)(❤️‍🩹|❤️|♥️|♥)/g, '$1 $2')
}

export const MESTIZO_RAZAS = new Set<string>(["mestizo", "mestizo_perro", "mestizo_gato"])

export function isMestizoRaza(raza?: string): boolean {
  return !!raza && MESTIZO_RAZAS.has(raza)
}

// Truncar ubicación: solo mostrar lo que está antes de la primera coma
export function truncateUbicacion(ubicacion?: string): string {
  if (!ubicacion) return ""
  const parts = ubicacion.split(",")
  return parts[0].trim()
}
