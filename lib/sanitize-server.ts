/**
 * Sanitizacion de inputs en el servidor (Node.js)
 * Version sin dependencias del DOM para APIs de Next.js
 */

// Configuracion: elimina todo HTML potencialmente peligroso
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi, // Scripts
  /<[^>]+on\w+=[^>]*>/gi, // Event handlers inline
  /javascript:/gi, // JavaScript protocol
  /data:text\/html/gi, // Data URIs
  /<iframe[^>]*>.*?<\/iframe>/gi, // Iframes
  /<object[^>]*>.*?<\/object>/gi, // Objects
  /<embed[^>]*>.*?<\/embed>/gi, // Embeds
  /<form[^>]*>.*?<\/form>/gi, // Forms
  /<[^>]+>/gi, // Cualquier etiqueta HTML
];

/**
 * Sanitiza un string eliminando HTML/JS peligroso
 * @param input String a sanitizar
 * @returns String limpio
 */
export function sanitizeText(input: string): string {
  if (!input) return "";

  let cleaned = input;

  // Eliminar patrones XSS conocidos
  XSS_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  return cleaned.trim();
}

/**
 * Sanitiza email (valida formato basico)
 * @param email Email a sanitizar
 * @returns Email limpio o vacio si es invalido
 */
export function sanitizeEmail(email: string): string {
  if (!email) return "";

  // Eliminar espacios y convertir a minusculas
  const cleaned = email.trim().toLowerCase();

  // Validacion basica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}

/**
 * Sanitiza telefono (elimina caracteres no permitidos)
 * @param phone Telefono a limpiar
 * @returns Telefono limpio
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return "";
  // Solo permite numeros, espacios, guiones, parentesis y el signo +
  return phone.replace(/[^\d\s\-+()]/g, "").trim();
}

/**
 * Sanitiza campos de texto enriquecido (permite formato basico)
 * @param input Texto a sanitizar
 * @returns Texto con formato basico seguro
 */
export function sanitizeRichText(input: string): string {
  if (!input) return "";

  let cleaned = input;

  // Eliminar scripts y elementos peligrosos pero permitir formato basico
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<form[^>]*>.*?<\/form>/gi,
    /<[^>]+on\w+=[^>]*>/gi,
    /javascript:/gi,
  ];

  dangerousPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  return cleaned.trim();
}

/**
 * Sanitiza un objeto completo
 * @param obj Objeto con strings a sanitizar
 * @returns Objeto sanitizado
 */
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      // Usar rich text solo para campos de descripcion
      if (
        key.toLowerCase().includes("descripcion") ||
        key.toLowerCase().includes("description")
      ) {
        sanitized[key] = sanitizeRichText(obj[key]);
      } else {
        sanitized[key] = sanitizeText(obj[key]);
      }
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}
