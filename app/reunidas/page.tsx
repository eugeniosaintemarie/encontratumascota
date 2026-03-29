"use client"

import { useState, useMemo } from "react"
import { useItemsPerPage } from "@/hooks/use-items-per-page"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { Header } from "@/components/header"
import { PawPrint } from "lucide-react"
import { Footer } from "@/components/footer"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { useAuth } from "@/lib/auth-context"
import type { Especie, Sexo } from "@/lib/types"

export default function ReunidasPage() {
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")
  const [raza, setRaza] = useState<string | "todos">("todos")

  const { isAuthenticated, requireAuth } = useAuth()

  const { publicaciones } = usePublicaciones()
  const { itemsPerPage, columns } = useItemsPerPage()

  const publicacionesReunidas = useMemo(() => {
    return publicaciones.filter((pub) => {
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (raza !== "todos" && pub.mascota.raza !== raza) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Reunidas = publicacion cerrada (no activa)
      return pub.activa === false
    })
  }, [especie, raza, sexo, ubicacion, publicaciones])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pt-4 pb-8 flex-1 w-full">
        <div className="space-y-4">
          <FiltrosPublicaciones
            tipoPublicacion={"adopcion"}
            especie={especie}
            raza={raza}
            sexo={sexo}
            ubicacion={ubicacion}
            fechaDesde={undefined}
            transitoUrgente={false}
            onTipoPublicacionChange={() => { /* noop: fixed to adopcion */ }}
            hideTipoSelector={true}
            wideUbicacion={true}
            onEspecieChange={(v) => setEspecie(v)}
            onRazaChange={(v) => setRaza(v)}
            onSexoChange={(v) => setSexo(v)}
            onUbicacionChange={(v) => setUbicacion(v)}
            onFechaDesdeChange={() => {}}
            onTransitoUrgenteChange={() => {}}
            onClearFilters={() => {
              setEspecie("todos")
              setRaza("todos")
              setSexo("todos")
              setUbicacion("")
            }}
            onSearch={() => {}}
            hasActiveFilters={especie !== "todos" || raza !== "todos" || sexo !== "todos" || ubicacion !== ""}
          />

          {publicacionesReunidas.length > 0 ? (
            <div className="responsive-cols">
              {publicacionesReunidas.slice(0, itemsPerPage).map((publicacion) => (
                <PublicacionCard
                  key={publicacion.id}
                  publicacion={publicacion}
                  isAuthenticated={isAuthenticated}
                  onRequireAuth={requireAuth}
                />
              ))}

              {/* Fill last row with invisible placeholders so layout looks full */}
              {(() => {
                const shown = publicacionesReunidas.slice(0, itemsPerPage)
                const remainder = shown.length % (columns || 1)
                const toFill = remainder === 0 ? 0 : (columns || 1) - remainder
                return Array.from({ length: toFill }).map((_, i) => (
                  <div key={`placeholder-reunidas-${i}`} className="invisible" aria-hidden>
                    <div className="group flex flex-col h-full" />
                  </div>
                ))
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16">
              <PawPrint className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground text-center">
                Todavía no hay mascotas que hayan sido reunidas con sus familias
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Las publicaciones cerradas aparecerán aquí
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
