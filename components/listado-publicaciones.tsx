"use client"

import { useState, useMemo } from "react"
import { PublicacionCard } from "@/components/publicacion-card"
import { FiltrosPublicaciones } from "@/components/filtros-publicaciones"
import { PawPrint } from "lucide-react"
import { usePublicaciones } from "@/lib/publicaciones-context"
import type { Especie, Sexo } from "@/lib/types"

interface ListadoPublicacionesProps {
  isAuthenticated?: boolean
  onRequireAuth?: (publicacionId: string) => void
}

export function ListadoPublicaciones({
  isAuthenticated = false,
  onRequireAuth,
}: ListadoPublicacionesProps) {
  const [especie, setEspecie] = useState<Especie | "todos">("todos")
  const [sexo, setSexo] = useState<Sexo | "todos">("todos")
  const [ubicacion, setUbicacion] = useState("")

  const { publicaciones } = usePublicaciones()

  const publicacionesFiltradas = useMemo(() => {
    return publicaciones.filter((pub) => {
      if (especie !== "todos" && pub.mascota.especie !== especie) return false
      if (sexo !== "todos" && pub.mascota.sexo !== sexo) return false
      if (
        ubicacion &&
        !pub.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      )
        return false
      // Excluir las que están en tránsito (van a otra página)
      if (pub.enTransito) return false
      return pub.activa
    })
  }, [especie, sexo, ubicacion])

  const hasActiveFilters =
    especie !== "todos" || sexo !== "todos" || ubicacion !== ""

  const clearFilters = () => {
    setEspecie("todos")
    setSexo("todos")
    setUbicacion("")
  }

  const handleSearch = () => {
    // La busqueda ya es reactiva, este handler es para el boton de lupa
  }

  return (
    <div className="space-y-4">
      <FiltrosPublicaciones
        especie={especie}
        sexo={sexo}
        ubicacion={ubicacion}
        onEspecieChange={setEspecie}
        onSexoChange={setSexo}
        onUbicacionChange={setUbicacion}
        onClearFilters={clearFilters}
        onSearch={handleSearch}
        hasActiveFilters={hasActiveFilters}
      />

      {publicacionesFiltradas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {publicacionesFiltradas.map((publicacion) => (
            <PublicacionCard
              key={publicacion.id}
              publicacion={publicacion}
              isAuthenticated={isAuthenticated}
              onRequireAuth={onRequireAuth}
            />
          ))}
        </div>
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
