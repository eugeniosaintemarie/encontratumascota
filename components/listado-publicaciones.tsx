"use client"

import { useState, useMemo } from "react"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react"
import { usePublicaciones } from "@/lib/publicaciones-context"
import { Button } from "@/components/ui/button"
import type { Especie, Sexo, TipoPublicacion } from "@/lib/types"

interface ListadoPublicacionesProps {
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: string) => void
}

export function ListadoPublicaciones({
  isAuthenticated = false,
  onRequireAuth,
}: ListadoPublicacionesProps) {
  const [tipoPublicacion, setTipoPublicacion] = useState<TipoPublicacion | undefined>(undefined)
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [raza, setRaza] = useState<string | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")
  const [fechaDesde, setFechaDesde] = useState<string | undefined>(undefined)
  const [transitoUrgente, setTransitoUrgente] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const { publicaciones } = usePublicaciones()

  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter((pub) => {
      if (tipoPublicacion !== undefined && pub.tipoPublicacion !== tipoPublicacion) return false
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (raza !== "todos" && pub.mascota.raza !== raza) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Filtrar por fechaDesde sólo para publicaciones de pérdida
      if (tipoPublicacion !== 'adopcion' && fechaDesde) {
        try {
          const since = new Date(fechaDesde)
          if (isNaN(since.getTime())) return false
          if (pub.fechaPublicacion < since) return false
        } catch { /* ignore parse errors */ }
      }
      // Filtrar por tránsito urgente
      if (tipoPublicacion === "perdida" && transitoUrgente && !pub.transitoUrgente) return false
      // Excluir las que están en tránsito (van a otra página)
      if (pub.enTransito) return false
      return pub.activa
    })
  }, [tipoPublicacion, especie, raza, sexo, ubicacion, transitoUrgente, publicaciones])

  const totalPages = Math.ceil(publicacionesFiltradas.length / ITEMS_PER_PAGE)
  const paginatedPublicaciones = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return publicacionesFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [publicacionesFiltradas, currentPage])

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

  const handleSearch = () => {
    // La busqueda ya es reactiva, este handler es para el boton de lupa
  }

  return (
    <div className="space-y-4">
      <FiltrosPublicaciones
        tipoPublicacion={tipoPublicacion}
        especie={especie}
        raza={raza}
        sexo={sexo}
        ubicacion={ubicacion}
        fechaDesde={fechaDesde}
        transitoUrgente={transitoUrgente}
        onTipoPublicacionChange={(v) => {
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {paginatedPublicaciones.map((publicacion) => (
              <div key={publicacion.id} className="fade-in">
                <PublicacionCard
                  publicacion={publicacion}
                  isAuthenticated={isAuthenticated}
                  onRequireAuth={onRequireAuth}
                />
              </div>
            ))}
          </div>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-4 pb-0">
              {currentPage > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="min-w-[100px]"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />

                </Button>
              ) : (
                <div className="min-w-[100px]" /> /* Espaciador invisible para mantener el centro */
              )}
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                {currentPage} / {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="min-w-[100px]"
                >

                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <div className="min-w-[100px]" /> /* Espaciador invisible para mantener el centro */
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16">
          <PawPrint className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground">
            No se encontraron mascotas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Intenta ajustar los filtros de busqueda
          </p>
        </div>
      )}
    </div>
  )
}
