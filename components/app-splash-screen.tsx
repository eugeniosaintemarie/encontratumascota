"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const SPLASH_VISIBLE_MS = 850
const SPLASH_FADE_MS = 350

export function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true

    if (!isStandalone) {
      return
    }

    setIsVisible(true)
    const fadeTimer = window.setTimeout(() => setIsFadingOut(true), SPLASH_VISIBLE_MS)
    const hideTimer = window.setTimeout(() => setIsVisible(false), SPLASH_VISIBLE_MS + SPLASH_FADE_MS)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#FFEFE6] via-white to-white transition-opacity duration-300 ${
        isFadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <div className="rounded-2xl bg-white/90 p-3 shadow-[0_12px_35px_rgba(214,101,40,0.18)] ring-1 ring-[#d66528]/20">
          <Image
            src="/logo.png"
            alt="Encontra Tu Mascota"
            width={84}
            height={84}
            priority
            className="h-20 w-20 rounded-xl"
          />
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight text-[#d66528]">Encontra Tu Mascota</p>
          <p className="mt-1 text-sm text-muted-foreground">Conectando mascotas con sus familias</p>
        </div>
      </div>
    </div>
  )
}