"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Footer() {
  const [reunidas, setReunidas] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setReunidas(data.mascotasReunidas ?? 0))
      .catch(() => setReunidas(0))
  }, [])

  return (
    <footer className="border-t border-border">
      <div className="bg-primary/10 py-4">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <p className="text-sm text-foreground flex items-center gap-2">
            <span className="text-2xl font-bold text-primary leading-none">
              {reunidas !== null ? reunidas : "..."}
            </span>
            <span>mascotas reunidas con sus familias</span>
          </p>
          <p className="text-sm text-foreground text-center sm:text-left">
            No encontras tu mascota?{" "}
            <Link href="/transitadas" className="text-primary hover:underline font-medium">
              Fijate si le dieron transito ubicandola con otra familia
            </Link>
          </p>
        </div>
      </div>
      <div className="py-6 bg-background">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-foreground/60">
          <p>
            Encontra Tu Mascota - Plataforma colaborativa para reunir mascotas
            perdidas con sus familias
          </p>
        </div>
      </div>
    </footer>
  )
}
