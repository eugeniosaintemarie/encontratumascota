"use client"

import { useCallback, useEffect, useRef } from "react"

const RECAPTCHA_SCRIPT_ID = "recaptcha-v3-script"

/**
 * Hook para Google reCAPTCHA v3.
 * Carga el script bajo demanda y expone execute(action).
 */
export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const readyRef = useRef(false)

  useEffect(() => {
    if (!siteKey) return
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      readyRef.current = true
      return
    }

    const script = document.createElement("script")
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => {
      readyRef.current = true
    }
    document.head.appendChild(script)
  }, [siteKey])

  const execute = useCallback(
    async (action: string): Promise<string> => {
      if (!siteKey) return ""

      // Esperar a que grecaptcha este disponible
      const waitForRecaptcha = () =>
        new Promise<void>((resolve) => {
          if (typeof window !== "undefined" && (window as any).grecaptcha?.ready) {
            ;(window as any).grecaptcha.ready(() => resolve())
          } else {
            const interval = setInterval(() => {
              if (typeof window !== "undefined" && (window as any).grecaptcha?.ready) {
                clearInterval(interval)
                ;(window as any).grecaptcha.ready(() => resolve())
              }
            }, 100)
            // Timeout de seguridad
            setTimeout(() => clearInterval(interval), 5000)
          }
        })

      await waitForRecaptcha()
      const token: string = await (window as any).grecaptcha.execute(siteKey, { action })
      return token
    },
    [siteKey]
  )

  return { execute, ready: readyRef.current }
}
