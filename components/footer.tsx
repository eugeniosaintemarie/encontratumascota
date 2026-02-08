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
      <div className="bg-[#FF8A65]/10 py-4">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <p className="text-sm text-foreground flex items-center gap-2">
            <span className="text-2xl font-bold text-[#FF8A65] leading-none">
              {reunidas !== null ? reunidas : "..."}
            </span>
            <span>mascotas reunidas con sus familias</span>
          </p>
          <p className="text-sm text-foreground text-center sm:text-left">
            No encontras tu mascota?{" "}
            <Link href="/transitadas" className="text-[#FF8A65] hover:underline font-medium">
              Fijate si le dieron tránsito ubicandola con otra familia
            </Link>
          </p>
        </div>
      </div>
      <div className="py-6 bg-background">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-foreground/60">
          <p>
            Encontra Tu Mascota |{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSeL7DnKWx8JigHW6-PIbsvAN7SbXmKwKROYLjAHnmdt0e-J7A/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline italic"
            >
              Feedback
            </a>
            {" "}|{" "}
            <a
              href="https://eugeniosaintemarie.github.io?ref=encontratumascota"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              ∃ugenio © {new Date().getFullYear()}
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
