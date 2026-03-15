"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const enableServiceWorker = process.env.NEXT_PUBLIC_ENABLE_SW === "true"

    // Emergency-safe default: clear stale SW/cache unless explicitly enabled.
    if (!enableServiceWorker) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )
        .catch((err) => {
          console.log("SW unregister failed:", err)
        })

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch((err) => {
            console.log("Cache cleanup failed:", err)
          })
      }
      return
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered:", registration.scope)
      })
      .catch((err) => {
        console.log("SW registration failed:", err)
      })
  }, [])

  return null
}
