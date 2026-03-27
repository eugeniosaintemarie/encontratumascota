"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const RECAPTCHA_SCRIPT_ID = "recaptcha-v3-script"

const siteKeyMissingWarned = new Set<string>()

/**
 * Hook para Google reCAPTCHA v3.
 * Carga el script bajo demanda y expone execute(action).
 */
export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const [ready, setReady] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!siteKey) {
      if (!siteKeyMissingWarned.has("recaptcha")) {
        console.warn("[useRecaptcha] NEXT_PUBLIC_RECAPTCHA_SITE_KEY is empty")
        siteKeyMissingWarned.add("recaptcha")
      }
      return
    }
    if (document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      setReady(true)
      return
    }

    const script = document.createElement("script")
    script.id = RECAPTCHA_SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => {
      setReady(true)
    }
    document.head.appendChild(script)

    // Cleanup: remove script on unmount if we added it
    return () => {
      const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID)
      if (existingScript && existingScript === script) {
        existingScript.remove()
      }
    }
  }, [siteKey])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = useCallback(
    async (action: string): Promise<string> => {
      if (!siteKey) return ""

      // Abort any previous pending execution
      abortControllerRef.current?.abort()
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      // Esperar a que grecaptcha este disponible
      const waitForRecaptcha = () =>
        new Promise<void>((resolve, reject) => {
          if (abortController.signal.aborted) {
            reject(new Error("Aborted"))
            return
          }

          if (typeof window !== "undefined" && (window as any).grecaptcha?.ready) {
            ;(window as any).grecaptcha.ready(() => {
              if (!abortController.signal.aborted) resolve()
            })
            return
          }

          let intervalId: ReturnType<typeof setInterval> | null = null
          let timeoutId: ReturnType<typeof setTimeout> | null = null

          const cleanup = () => {
            if (intervalId) clearInterval(intervalId)
            if (timeoutId) clearTimeout(timeoutId)
          }

          abortController.signal.addEventListener("abort", () => {
            cleanup()
            reject(new Error("Aborted"))
          })

          intervalId = setInterval(() => {
            if (abortController.signal.aborted) {
              cleanup()
              return
            }
            if (typeof window !== "undefined" && (window as any).grecaptcha?.ready) {
              cleanup()
              ;(window as any).grecaptcha.ready(() => {
                if (!abortController.signal.aborted) resolve()
              })
            }
          }, 100)

          // Timeout de seguridad
          timeoutId = setTimeout(() => {
            cleanup()
            reject(new Error("reCAPTCHA load timeout"))
          }, 5000)
        })

      try {
        await waitForRecaptcha()
        const token: string = await (window as any).grecaptcha.execute(siteKey, { action })
        return token
      } catch (error) {
        if ((error as Error).message === "Aborted") return ""
        throw error
      }
    },
    [siteKey]
  )

  return { execute, ready }
}
