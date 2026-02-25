export function isDemoHost(host?: string) {
  // Normalizar
  if (!host) {
    const isDemoBranch = process.env.VERCEL_GIT_COMMIT_REF === "demo"
    const isDev = process.env.NODE_ENV === "development"
    // Consider development mode as demo for local dev servers
    return (
      process.env.NEXT_PUBLIC_IS_DEMO === "true" ||
      isDemoBranch ||
      isDev
    )
  }
  const h = host.toLowerCase()

  // Demo hosts: vercel demo domain and localhost
  if (h.includes("demo.encontratumascota.ar")) return true
  if (h.startsWith("localhost") || h.startsWith("127.0.0.1")) return true

  // Production host explicit
  if (h.includes("www.encontratumascota.ar")) return false

  // Fallback to env/branch
  const isDemoBranch = process.env.VERCEL_GIT_COMMIT_REF === "demo"
  return process.env.NEXT_PUBLIC_IS_DEMO === "true" || isDemoBranch
}

export function isDemoRequest(request?: Request | string) {
  if (!request) return isDemoHost(undefined)
  try {
    const url = typeof request === "string" ? new URL(request) : new URL(request.url)
    return isDemoHost(url.host)
  } catch {
    return isDemoHost(undefined)
  }
}

export function isProductionHost(host?: string) {
  if (!host) return !isDemoHost(undefined)
  return !isDemoHost(host)
}
