"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    // Incident mode: disable PWA registration and clean old caches/sw.
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
  }, [])

  return null
}
