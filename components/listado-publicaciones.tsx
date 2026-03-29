"use client"

import { useState, useMemo } from "react"
import { useEffect } from "react"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { Button } from "@/components/ui/button"
import type { Especie, Sexo, TipoPublicacion, Publicacion } from "@/lib/types"
import { useItemsPerPage } from "@/hooks/use-items-per-page"

interface ListadoPublicacionesProps {
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: string) => void
  publicacionesBase?: Publicacion[]
  fixedTipoPublicacion?: TipoPublicacion
  hideTipoSelector?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function ListadoPublicaciones({
  isAuthenticated = false,
  onRequireAuth,
  publicacionesBase,
  fixedTipoPublicacion,
  hideTipoSelector = false,
  emptyTitle = "Todavía no hay publicaciones",
  emptyDescription = "",
}: ListadoPublicacionesProps) {
  const [tipoPublicacion, setTipoPublicacion] = useState<TipoPublicacion | undefined>(fixedTipoPublicacion)
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [raza, setRaza] = useState<string | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")
  const [fechaDesde, setFechaDesde] = useState<string | undefined>(undefined)
  const [transitoUrgente, setTransitoUrgente] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const { itemsPerPage, columns } = useItemsPerPage()

  const { publicaciones } = usePublicaciones()
  const sourcePublicaciones = publicacionesBase ?? publicaciones
  const tipoActivo = fixedTipoPublicacion ?? tipoPublicacion

  const publicacionesFiltradas = useMemo(() => {
    return sourcePublicaciones.filter((pub) => {
      // Excluir publicaciones "buscadas" del home (tienen su propia página)
      if (pub.tipoPublicacion === "buscada") return false
      if (tipoActivo !== undefined && pub.tipoPublicacion !== tipoActivo) return false
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (raza !== "todos" && pub.mascota.raza !== raza) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Filtrar por fechaDesde sólo para publicaciones de pérdida
      if (tipoActivo !== 'adopcion' && fechaDesde) {
        try {
          const since = new Date(fechaDesde)
          if (isNaN(since.getTime())) return false
          if (pub.fechaPublicacion < since) return false
        } catch { /* ignore parse errors */ }
      }
      // Filtrar por tránsito urgente
      if (tipoActivo === "perdida" && transitoUrgente && !pub.transitoUrgente) return false
      return pub.activa
    })
  }, [tipoActivo, especie, raza, sexo, ubicacion, transitoUrgente, sourcePublicaciones, fechaDesde])

  const totalPages = Math.ceil(publicacionesFiltradas.length / itemsPerPage)
  const paginatedPublicaciones = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return publicacionesFiltradas.slice(startIndex, startIndex + itemsPerPage)
  }, [publicacionesFiltradas, currentPage, itemsPerPage])

  const hasActiveFilters =
    especie !== "todos" || raza !== "todos" || sexo !== "todos" || ubicacion !== "" || transitoUrgente || !!fechaDesde

  const clearFilters = () => {
    setEspecie("todos")
    setRaza("todos")
    setSexo("todos")
    setUbicacion("")
    setFechaDesde(undefined)
    setTransitoUrgente(false)
    setCurrentPage(1)
  }

  // Reset page when itemsPerPage changes (responsive)
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  useEffect(() => {
    if (fixedTipoPublicacion) {
      setTipoPublicacion(fixedTipoPublicacion)
      setCurrentPage(1)
    }
  }, [fixedTipoPublicacion])

  const handleSearch = () => {
    // La busqueda ya es reactiva, este handler es para el boton de lupa
  }

  return (
    <div className="space-y-4">
      <FiltrosPublicaciones
        tipoPublicacion={tipoActivo}
        especie={especie}
        raza={raza}
        sexo={sexo}
        ubicacion={ubicacion}
        fechaDesde={fechaDesde}
        transitoUrgente={transitoUrgente}
        hideTipoSelector={hideTipoSelector}
        wideUbicacion={tipoActivo === "adopcion"}
        onTipoPublicacionChange={(v) => {
          if (fixedTipoPublicacion) return
          setTipoPublicacion(v)
          setCurrentPage(1)
        }}
        onEspecieChange={(v) => {
          setEspecie(v)
          setCurrentPage(1)
        }}
        onRazaChange={(v) => {
          setRaza(v)
          setCurrentPage(1)
        }}
        onSexoChange={(v) => {
          setSexo(v)
          setCurrentPage(1)
        }}
        onUbicacionChange={(v) => {
          setUbicacion(v)
          setCurrentPage(1)
        }}
        onFechaDesdeChange={(v) => {
          setFechaDesde(v || undefined)
          setCurrentPage(1)
        }}
        onTransitoUrgenteChange={(v) => {
          setTransitoUrgente(v)
          setCurrentPage(1)
        }}
        onClearFilters={clearFilters}
        onSearch={handleSearch}
        hasActiveFilters={hasActiveFilters}
      />
      {/* Renderizado de Publicaciones */}
      {paginatedPublicaciones.length > 0 ? (
        <>
          <div className="responsive-cols">
            {paginatedPublicaciones.map((publicacion) => (
              <div key={publicacion.id} className="fade-in">
                <PublicacionCard
                  publicacion={publicacion}
                  isAuthenticated={isAuthenticated}
                  onRequireAuth={onRequireAuth}
                />
              </div>
            ))}

            {/* Placeholders to fill last row so the grid always appears complete */}
            {(() => {
              const remainder = paginatedPublicaciones.length % (columns || 1)
              const toFill = remainder === 0 ? 0 : (columns || 1) - remainder
              return Array.from({ length: toFill }).map((_, i) => (
                <div key={`placeholder-${i}`} className="fade-in invisible" aria-hidden>
                  <div className="group flex flex-col h-full" />
                </div>
              ))
            })()}
          </div>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 pb-0">
              {currentPage > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              ) : (
                <div className="w-10" /> /* Espaciador invisible para mantener el centro */
              )}
              <span className="text-sm text-muted-foreground w-12 text-center">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <div className="w-10" /> /* Espaciador invisible para mantener el centro */
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16">
          <PawPrint className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">
            {emptyTitle}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  )
}
