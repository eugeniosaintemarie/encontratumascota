/**
 * Sanitización de inputs con DOMPurify
 * Previene XSS y otros ataques de inyección
 */

import DOMPurify from "dompurify"

// Configuración por defecto: permite solo texto plano, sin HTML
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [] as string[], // No permitir ninguna etiqueta HTML
  ALLOWED_ATTR: [] as string[], // No permitir atributos
  KEEP_CONTENT: true, // Mantener el contenido de las etiquetas no permitidas
}

// Configuración para campos que permiten cierto formato (ej: descripciones)
const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"], // Solo formato básico
  ALLOWED_ATTR: [], // Sin atributos
}

/**
 * Sanitiza un string, eliminando todo HTML/JS
 * @param input String a sanitizar
 * @returns String limpio (solo texto)
 */
export function sanitizeText(input: string): string {
  if (!input) return ""
  return DOMPurify.sanitize(input, DEFAULT_CONFIG)
}

/**
 * Sanitiza un string permitiendo formato básico (negrita, cursiva, párrafos)
 * @param input String a sanitizar
 * @returns String con formato básico seguro
 */
export function sanitizeRichText(input: string): string {
  if (!input) return ""
  return DOMPurify.sanitize(input, RICH_TEXT_CONFIG)
}

/**
 * Sanitiza un email (solo valida formato, no modifica el contenido)
 * @param email Email a validar
 * @returns Email limpio o string vacío si es inválido
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ""
  const cleaned = sanitizeText(email).trim().toLowerCase()
  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(cleaned) ? cleaned : ""
}

/**
 * Sanitiza un teléfono (elimina caracteres no numéricos y espacios peligrosos)
 * @param phone Teléfono a limpiar
 * @returns Teléfono limpio
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ""
  // Solo permite números, espacios, guiones, paréntesis y el signo +
  return phone.replace(/[^\d\s\-+()]/g, "").trim()
}

/**
 * Sanitiza un objeto completo (útil para formularios)
 * @param obj Objeto con strings a sanitizar
 * @returns Objeto con todos los strings sanitizados
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      // Usar rich text solo para campos de descripción
      if (key.toLowerCase().includes("descripcion") || key.toLowerCase().includes("description")) {
        sanitized[key] = sanitizeRichText(sanitized[key])
      } else {
        sanitized[key] = sanitizeText(sanitized[key])
      }
    }
  }
  
  return sanitized
}

/**
 * Hook helper para sanitizar inputs de formularios en tiempo real
 * @param value Valor del input
 * @param type Tipo de sanitización ('text' | 'rich' | 'email' | 'phone')
 * @returns Valor sanitizado
 */
export function useSanitizedInput(value: string, type: "text" | "rich" | "email" | "phone" = "text"): string {
  switch (type) {
    case "rich":
      return sanitizeRichText(value)
    case "email":
      return sanitizeEmail(value)
    case "phone":
      return sanitizePhone(value)
    default:
      return sanitizeText(value)
  }
}
